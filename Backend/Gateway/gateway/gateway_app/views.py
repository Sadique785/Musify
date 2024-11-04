import httpx
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.http import HttpResponse
from django.conf import settings
import os
from dotenv import load_dotenv

load_dotenv()



class AuthMicroservice(APIView):

    session = httpx.Client()

    def get(self, request, path):
        print('GET request received')
        print('Request headers for the auth service:', request.headers)

        try:
            # Prepare headers to forward
            headers = dict(request.headers)

            # Remove Content-Length header for GET requests
            if 'Content-Length' in headers:
                del headers['Content-Length']


            auth_service_url = os.getenv('AUTH_SERVICE_URL')
            forward_url = f'{auth_service_url}/{path}'
            # with httpx.Client() as client:
            #     response = client.get(forward_url, headers=headers, params=request.GET)
            response = self.session.get(forward_url, headers=headers, params=request.GET)

            return Response(response.json(), status=response.status_code)

        except httpx.RequestError as e:
            print(f'Request failed: {e}')
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    def post(self, request, path):
        print('POST request received')

        try:
            auth_service_url = os.getenv('AUTH_SERVICE_URL')
            forward_url = f'{auth_service_url}/{path}'
            headers = dict(request.headers)

            # Remove 'Content-Length' to avoid issues
            if 'Content-Length' in headers:
                del headers['Content-Length']

            # Use the self.session to manage session cookies across requests
            response = self.session.post(forward_url, headers=headers, json=request.data)

            # Check if there's a 'set-cookie' header in the response
            set_cookie_headers = response.headers.get_list('set-cookie')
            print('Header details here:', response.headers)

            # Prepare the response to return to the frontend
            response_data = response.json()
            status_code = response.status_code

            # Create the response to be returned
            django_response = Response(response_data, status=status_code)

            # If 'set-cookie' is present, set it in the outgoing response
            if set_cookie_headers:
                for set_cookie_header in set_cookie_headers:
                    # Split the set-cookie header into key-value pairs
                    cookie_parts = set_cookie_header.split(';')
                    cookie_value = cookie_parts[0]
                    cookie_name, cookie_value = cookie_value.split('=')

                    # Check if the backend is setting an empty value (indicating cookie deletion)
                    if cookie_value == '':  # If cookie value is empty
                        django_response.delete_cookie(
                            key=cookie_name,
                            path='/',
                            max_age=0,  # Set max_age to 0 to ensure the cookie is deleted
                            samesite='Lax',
                        )

                    else:
                        # Otherwise, set the cookie as usual
                        django_response.set_cookie(
                            key=cookie_name,
                            value=cookie_value,
                            max_age=31449600,  # One year
                            path='/',
                            samesite='Lax',
                        )

            return django_response

        except httpx.RequestError as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

            
    def put(self, request, path):
        print('Put Request Received')

        try:
            print('reached here')
            auth_service_url  = os.getenv('AUTH_SERVICE_URL')
            forward_url = f'{auth_service_url}/{path}'
            headers = dict(request.headers)
            if 'Content-Length' in headers:
                del headers['Content-Length']
            print('Headers in PUT request:', headers.get('X-Csrftoken'))  
            print('GUYS HEADERS',headers)
            
            # Print headers before forwarding
            print('Headers before forwarding:', headers)
            
            if 'image' in request.FILES:
                files = {'image': request.FILES['image']}
                response = self.session.put(forward_url, headers=headers, files=files)
            else:
                response = self.session.put(forward_url, headers=headers, json=request.data)

            # Print headers after receiving response
            print('Headers after receiving response:', response.headers)

            return Response(response.json(), status=response.status_code)
        except httpx.ResponseError as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        
class MediaFilesProxy(APIView):
    def get(self, request, path):
        # media_url = f"http://localhost:8001/media/{path}"


        media_service_url = os.getenv('MEDIA_SERVICE_URL')
        media_url = f"{media_service_url}/{path}"

        try:
            with httpx.Client() as client:
                response = client.get(media_url)
                
                if response.status_code == 200:
                    content_type = response.headers.get("content-type", "application/octet-stream")
                    return HttpResponse(response.content, content_type=content_type)
                else:
                    return Response({"error": "File not found"}, status=response.status_code)

        except httpx.RequestError as e:
            return Response({"error": f"Service unavailable: {str(e)}"}, status=503)
        

        
        
class AdminService(APIView):

    session = httpx.Client()

    def get(self, request, path):
        print('GET request received for admin-side')
        print('path here', path)
        user_id = request.GET.get('id')
        print(user_id)

        try:
            headers = dict(request.headers)

            if 'Content-Length' in headers:
                del headers['Content-Length']

            admin_service_url = os.getenv('ADMIN_SERVICE_URL')
            forward_url = f'{admin_service_url}/{path}'

            with httpx.Client() as client:
                response = client.get(forward_url, headers=headers, params=request.GET)

            return Response(response.json(), status=response.status_code)

        except httpx.RequestError as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    def post(self, request, path):
        print('POST request received for admin-side')

        try:
            admin_service_url = os.getenv('ADMIN_SERVICE_URL')
            forward_url = f'{admin_service_url}/{path}'
            headers = dict(request.headers)

            # Remove 'Content-Length' to avoid issues
            if 'Content-Length' in headers:
                del headers['Content-Length']

            # Use session to manage cookies across requests
            response = self.session.post(forward_url, headers=headers, json=request.data)

            # Check if there's a 'set-cookie' header in the response
            set_cookie_header = response.headers.get('set-cookie')
            print('Admin POST response headers:', response.headers)

            # Prepare the response to return to the frontend
            response_data = response.json()
            status_code = response.status_code

            # Create the response to be returned
            django_response = Response(response_data, status=status_code)

            # If 'set-cookie' is present, set it in the outgoing response
            if set_cookie_header:
                # Extract the cookie value (e.g., 'csrftoken=CFeXfO6dfJztMwSegRjKYOeYou3B2AcF; ...')
                cookie_value = set_cookie_header.split(';')[0]
                cookie_name, cookie_value = cookie_value.split('=')

                # Add the cookie to the Django response
                django_response.set_cookie(
                    key=cookie_name,
                    value=cookie_value,
                    max_age=31449600,  # One year
                    path='/',
                    samesite='Lax',
                )

            return django_response

        except httpx.RequestError as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)



class ContentMicroservice(APIView):

    session = httpx.Client()

    def get(self, request, path):
        print('GET request received for content service')

        try:
            print('request header from content', request.headers, request.GET)
            headers = dict(request.headers)
            if 'Content-Length' in headers:
                del headers['Content-Length']

            content_service_url = os.getenv('CONTENT_SERVICE_URL')
            forward_url = f'{content_service_url}/{path}'
            
            with httpx.Client() as client:
                response = client.get(forward_url, headers=headers, params=request.GET)

            return Response(response.json(), status=response.status_code)

        except httpx.RequestError as e:
            print(f'Request failed: {e}')
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    def post(self, request, path):
        print('POST request received for content service')

        try:
            content_service_url = os.getenv('CONTENT_SERVICE_URL')
            forward_url = f'{content_service_url}/{path}'
            headers = dict(request.headers)

            if 'Content-Length' in headers:
                del headers['Content-Length']

            response = self.session.post(forward_url, headers=headers, json=request.data)

            set_cookie_header = response.headers.get('set-cookie')
            print('Header details here:', response.headers)

            response_data = response.json()
            status_code = response.status_code

            django_response = Response(response_data, status=status_code)

            if set_cookie_header:
                cookie_value = set_cookie_header.split(';')[0]
                cookie_name, cookie_value = cookie_value.split('=')
                django_response.set_cookie(
                    key=cookie_name,
                    value=cookie_value,
                    max_age=31449600,  # One year
                    path='/',
                    samesite='Lax',
                )

            return django_response

        except httpx.RequestError as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    def put(self, request, path):
        print('PUT request received for content service')

        try:
            content_service_url = os.getenv('CONTENT_SERVICE_URL')
            forward_url = f'{content_service_url}/{path}'
            headers = dict(request.headers)

            if 'Content-Length' in headers:
                del headers['Content-Length']

            if 'video' in request.FILES:
                files = {'video': request.FILES['video']}
                response = self.session.put(forward_url, headers=headers, files=files)
            else:
                response = self.session.put(forward_url, headers=headers, json=request.data)

            print('Headers after receiving response:', response.headers)

            return Response(response.json(), status=response.status_code)

        except httpx.RequestError as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        



class UnifiedService(APIView):
    session = httpx.Client()

    def get(self, request, path):
        print('GET request received for', path)

        try:
            headers = dict(request.headers)
            if 'Content-Length' in headers:
                del headers['Content-Length']

            # Determine which service to forward the request to
            if path.startswith('auth/'):
                service_url = os.getenv('AUTH_SERVICE_URL')
            elif path.startswith('admin-side/'):
                service_url = os.getenv('ADMIN_SERVICE_URL')
            elif path.startswith('friends/'):
                service_url = os.getenv('FRIENDS_SERVICE_URL')  # Assuming you have a friends service URL set up
            else:
                return Response({'error': 'Invalid path'}, status=status.HTTP_404_NOT_FOUND)

            forward_url = f'{service_url}/{path}'
            response = self.session.get(forward_url, headers=headers, params=request.GET)

            return Response(response.json(), status=response.status_code)

        except httpx.RequestError as e:
            print(f'Request failed: {e}')
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    def post(self, request, path):
        print('POST request received for', path)

        try:
            headers = dict(request.headers)
            if 'Content-Length' in headers:
                del headers['Content-Length']

            # Determine which service to forward the request to
            if path.startswith('auth/'):
                service_url = os.getenv('AUTH_SERVICE_URL')
            elif path.startswith('admin-side/'):
                service_url = os.getenv('ADMIN_SERVICE_URL')
            elif path.startswith('friends/'):
                service_url = os.getenv('FRIENDS_SERVICE_URL')
            else:
                return Response({'error': 'Invalid path'}, status=status.HTTP_404_NOT_FOUND)

            forward_url = f'{service_url}/{path}'
            response = self.session.post(forward_url, headers=headers, json=request.data)

            # Create the Response object to return
            django_response = Response(response.json(), status=response.status_code)

            # Handle cookies similarly as in your previous implementation
            self.handle_cookies(django_response, response.headers)

            return django_response

        except httpx.RequestError as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    def handle_cookies(self, django_response, response_headers):
        set_cookie_headers = response_headers.get_list('set-cookie')
        for set_cookie_header in set_cookie_headers:
            cookie_parts = set_cookie_header.split(';')
            cookie_value = cookie_parts[0]
            cookie_name, cookie_value = cookie_value.split('=')

            if cookie_value == '':  # If cookie value is empty
                django_response.delete_cookie(
                    key=cookie_name,
                    path='/',
                    max_age=0,
                    samesite='Lax',
                )
            else:
                django_response.set_cookie(
                    key=cookie_name,
                    value=cookie_value,
                    max_age=31449600,  # One year
                    path='/',
                    samesite='Lax',
                )
class FriendsService(APIView):
    session = httpx.Client()

    def get(self, request, path):
        print('GET request received for friends service')
        print('Path here:', path)
        
        # Get any required parameters
        user_id = request.GET.get('id')
        print('User ID:', user_id)

        try:
            headers = dict(request.headers)

            if 'Content-Length' in headers:
                del headers['Content-Length']

            friends_service_url = os.getenv('FRIENDS_SERVICE_URL')
            forward_url = f'{friends_service_url}/{path}'

            with httpx.Client() as client:
                response = client.get(forward_url, headers=headers, params=request.GET)

                print('Response Content:', response.content)  # Log the response content


            return Response(response.json(), status=response.status_code)

        except httpx.RequestError as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    def post(self, request, path):
        print('POST request received for friends service')

        try:
            friends_service_url = os.getenv('FRIENDS_SERVICE_URL')
            forward_url = f'{friends_service_url}/{path}'
            headers = dict(request.headers)

            # Remove 'Content-Length' to avoid issues
            if 'Content-Length' in headers:
                del headers['Content-Length']

            # Use session to manage cookies across requests
            response = self.session.post(forward_url, headers=headers, json=request.data)

            response_data = response.json()
            status_code = response.status_code
            
            django_response = Response(response_data, status=status_code)

            # If 'set-cookie' is present, set it in the outgoing response
            set_cookie_header = response.headers.get('set-cookie')
            print('Friends POST response headers:', response.headers)

            if set_cookie_header:
                # Extract the cookie value
                cookie_value = set_cookie_header.split(';')[0]
                cookie_name, cookie_value = cookie_value.split('=')

                # Add the cookie to the Django response
                django_response.set_cookie(
                    key=cookie_name,
                    value=cookie_value,
                    max_age=31449600,  # One year
                    path='/',
                    samesite='Lax',
                )

            return django_response

        except httpx.RequestError as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
    

    def delete(self, request, path):
        print('DELETE request received for friends service')

        try:
            friends_service_url = os.getenv('FRIENDS_SERVICE_URL')
            forward_url = f'{friends_service_url}/{path}'
            headers = dict(request.headers)

            # Remove 'Content-Length' to avoid issues
            if 'Content-Length' in headers:
                del headers['Content-Length']

            # Use the DELETE request without a body
            response = self.session.delete(forward_url, headers=headers, params=request.GET)

            response_data = response.json()
            status_code = response.status_code

            django_response = Response(response_data, status=status_code)

            # Set cookies in the outgoing response if applicable
            set_cookie_header = response.headers.get('set-cookie')
            if set_cookie_header:
                cookie_value = set_cookie_header.split(';')[0]
                cookie_name, cookie_value = cookie_value.split('=')

                # Add the cookie to the Django response
                django_response.set_cookie(
                    key=cookie_name,
                    value=cookie_value,
                    max_age=31449600,  # One year
                    path='/',
                    samesite='Lax',
                )

            return django_response

        except httpx.RequestError as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)