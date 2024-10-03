import httpx
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.http import HttpResponse
import os
from dotenv import load_dotenv

load_dotenv()



class AuthMicroservice(APIView):

    session = httpx.Client()

    def get(self, request, path):
        print('GET request received')

        try:
            # Prepare headers to forward
            headers = dict(request.headers)

            # Remove Content-Length header for GET requests
            if 'Content-Length' in headers:
                del headers['Content-Length']


            auth_service_url = os.getenv('AUTH_SERVICE_URL')
            forward_url = f'{auth_service_url}/{path}'
            with httpx.Client() as client:
                response = client.get(forward_url, headers=headers, params=request.GET)

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
            set_cookie_header = response.headers.get('set-cookie')
            print('Header details here:', response.headers)

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

    def get(self, request, path):
        
        print('GET request received for admin-side')

        try:
            headers = dict(request.headers)

            if 'Content-Length' in headers:
                del headers['Content-Length']

            # admin_service_url = f'http://localhost:8001/admin-side/{path}'
            admin_service_url = os.getenv('ADMIN_SERVICE_URL')
            forward_url = f'{admin_service_url}/{path}'


            print(f'Forwarding GET request to: {forward_url}')
            print('Headers:', headers)
            print('Query Params:', request.GET)

            with httpx.Client() as client:
                response = client.get(forward_url, headers=headers, params=request.GET)
                print(f"Response status code: {response.status_code}")
                print(f"Response content: {response.content}")  # Log raw response content

            return Response(response.json(), status=response.status_code)

        except httpx.RequestError as e:
            print(f'Request failed: {e}')
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    def post(self, request, path):
        print('POST request received for admin-side')

        try:
            # admin_service_url = f'http://localhost:8001/admin-side/{path}'
            admin_service_url = os.getenv('ADMIN_SERVICE_URL')
            forward_url = f'{admin_service_url}/{path}'


            with httpx.Client() as client:
                response = client.post(forward_url, json=request.data)
                print('Admin POST response headers:', response.headers)

            return Response(response.json(), status=response.status_code)

        except httpx.RequestError as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
