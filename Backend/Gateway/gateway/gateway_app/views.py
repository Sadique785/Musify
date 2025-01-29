import logging
import httpx
import os
import time
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.http import HttpResponse
from django.conf import settings

from dotenv import load_dotenv

load_dotenv()


logger = logging.getLogger(__name__)

# class AuthMicroservice(APIView):

#     session = httpx.Client()

#     def get(self, request, path):
#         print('GET request received')
#         print('Request headers for the auth service:', request.headers)

#         try:
#             # Prepare headers to forward
#             headers = dict(request.headers)

#             # Remove Content-Length header for GET requests
#             if 'Content-Length' in headers:
#                 del headers['Content-Length']


#             auth_service_url = os.getenv('AUTH_SERVICE_URL')
#             forward_url = f'{auth_service_url}/{path}'
#             # with httpx.Client() as client:
#             #     response = client.get(forward_url, headers=headers, params=request.GET)
#             response = self.session.get(forward_url, headers=headers, params=request.GET)

#             return Response(response.json(), status=response.status_code)

#         except httpx.RequestError as e:
#             print(f'Request failed: {e}')
#             return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

#     def post(self, request, path):
#         print('POST request received')
#         print(f'Path: {path}')  # Log the path
        
#         try:
#             auth_service_url = os.getenv('AUTH_SERVICE_URL')
#             forward_url = f'{auth_service_url}/{path}'
#             print(f'Forwarding to URL: {forward_url}')  # Log the forward URL
            
#             headers = dict(request.headers)
#             if 'Content-Length' in headers:
#                 del headers['Content-Length']
            
#             print(f'Request headers: {headers}')  # Log headers being sent
#             print(f'Request data: {request.data}')  # Log request data
            
#             try:
#                 response = self.session.post(
#                     forward_url, 
#                     headers=headers, 
#                     json=request.data,
#                     timeout=30  # Add explicit timeout
#                 )
                
#                 print(f'Auth service response status: {response.status_code}')
#                 print(f'Auth service response headers: {dict(response.headers)}')
#                 print(f'Auth service response body: {response.text}')  # Use .text instead of .json() for raw response
                
#                 # Try to parse JSON response
#                 try:
#                     response_data = response.json()
#                 except ValueError as json_err:
#                     print(f'JSON parsing error: {json_err}')
#                     print(f'Raw response content: {response.text}')
#                     return Response(
#                         {'error': 'Invalid JSON response from auth service'}, 
#                         status=status.HTTP_502_BAD_GATEWAY
#                     )
                
#                 status_code = response.status_code
#                 django_response = Response(response_data, status=status_code)
                
#                 # Handle cookies
#                 set_cookie_headers = response.headers.get_list('set-cookie')
#                 if set_cookie_headers:
#                     print(f'Found cookies to set: {set_cookie_headers}')
#                     for set_cookie_header in set_cookie_headers:
#                         cookie_parts = set_cookie_header.split(';')
#                         cookie_value = cookie_parts[0]
#                         try:
#                             cookie_name, cookie_value = cookie_value.split('=')
#                             print(f'Setting cookie: {cookie_name}={cookie_value}')
                            
#                             if cookie_value == '':
#                                 django_response.delete_cookie(
#                                     key=cookie_name,
#                                     path='/',
#                                     max_age=0,
#                                     samesite='Lax',
#                                 )
#                             else:
#                                 django_response.set_cookie(
#                                     key=cookie_name,
#                                     value=cookie_value,
#                                     max_age=31449600,
#                                     path='/',
#                                     samesite='Lax',
#                                 )
#                         except ValueError as cookie_err:
#                             print(f'Cookie parsing error: {cookie_err}')
#                             # Continue processing other cookies if one fails
#                             continue
                
#                 return django_response
                
#             except httpx.TimeoutException as timeout_err:
#                 print(f'Request timed out: {timeout_err}')
#                 return Response(
#                     {'error': 'Request to auth service timed out'}, 
#                     status=status.HTTP_504_GATEWAY_TIMEOUT
#                 )
                
#             except httpx.HTTPStatusError as http_err:
#                 print(f'HTTP error occurred: {http_err}')
#                 return Response(
#                     {'error': str(http_err)}, 
#                     status=http_err.response.status_code
#                 )
                
#         except Exception as e:
#             print(f'Unexpected error: {str(e)}')
#             import traceback
#             print(f'Traceback: {traceback.format_exc()}')
#             return Response(
#                 {'error': 'Internal server error'}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
            
#     def put(self, request, path):
#         print('Put Request Received')

#         try:
#             print('reached here')
#             auth_service_url  = os.getenv('AUTH_SERVICE_URL')
#             forward_url = f'{auth_service_url}/{path}'
#             headers = dict(request.headers)
#             if 'Content-Length' in headers:
#                 del headers['Content-Length']
#             print('Headers in PUT request:', headers.get('X-Csrftoken'))  
#             print('GUYS HEADERS',headers)
            
#             # Print headers before forwarding
#             print('Headers before forwarding:', headers)
            
#             if 'image' in request.FILES:
#                 files = {'image': request.FILES['image']}
#                 response = self.session.put(forward_url, headers=headers, files=files)
#             else:
#                 response = self.session.put(forward_url, headers=headers, json=request.data)

#             # Print headers after receiving response
#             print('Headers after receiving response:', response.headers)

#             return Response(response.json(), status=response.status_code)
#         except httpx.ResponseError as e:
#             return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)


class AuthMicroservice(APIView):
    session = httpx.Client(timeout=30)  # Set default timeout for all requests

    def get(self, request, path):
        print('GET request received')
        print('Request headers for the auth service:', request.headers)

        try:
            headers = dict(request.headers)
            if 'Content-Length' in headers:
                del headers['Content-Length']

            auth_service_url = os.getenv('AUTH_SERVICE_URL')
            forward_url = f'{auth_service_url}/{path}'
            
            response = self.session.get(
                forward_url, 
                headers=headers, 
                params=request.GET,
                timeout=30
            )

            return Response(response.json(), status=response.status_code)

        except httpx.TimeoutException as e:
            print(f'Request timed out: {e}')
            return Response(
                {'error': 'Request to auth service timed out'}, 
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except httpx.RequestError as e:
            print(f'Request failed: {e}')
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            print(f'Unexpected error: {e}')
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, path):
        print('POST request received')
        print(f'Path: {path}')
        
        try:
            auth_service_url = os.getenv('AUTH_SERVICE_URL')
            forward_url = f'{auth_service_url}/{path}'
            print(f'Forwarding to URL: {forward_url}')
            
            headers = dict(request.headers)
            if 'Content-Length' in headers:
                del headers['Content-Length']
            
            print(f'Request headers: {headers}')
            print(f'Request data: {request.data}')
            
            response = self.session.post(
                forward_url, 
                headers=headers, 
                json=request.data,
                timeout=30
            )
            
            print(f'Auth service response status: {response.status_code}')
            print(f'Auth service response headers: {dict(response.headers)}')
            
            try:
                response_data = response.json()
            except ValueError as json_err:
                print(f'JSON parsing error: {json_err}')
                print(f'Raw response content: {response.text}')
                return Response(
                    {'error': 'Invalid JSON response from auth service'}, 
                    status=status.HTTP_502_BAD_GATEWAY
                )
            
            django_response = Response(response_data, status=response.status_code)
            
            # Handle cookies
            set_cookie_headers = response.headers.get_list('set-cookie')
            if set_cookie_headers:
                print(f'Found cookies to set: {set_cookie_headers}')
                for set_cookie_header in set_cookie_headers:
                    cookie_parts = set_cookie_header.split(';')
                    cookie_value = cookie_parts[0]
                    try:
                        cookie_name, cookie_value = cookie_value.split('=')
                        print(f'Setting cookie: {cookie_name}={cookie_value}')
                        
                        if cookie_value == '':
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
                                max_age=31449600,
                                path='/',
                                samesite='Lax',
                            )
                    except ValueError as cookie_err:
                        print(f'Cookie parsing error: {cookie_err}')
                        continue
            
            return django_response
            
        except httpx.TimeoutException as e:
            print(f'Request timed out: {e}')
            return Response(
                {'error': 'Request to auth service timed out'}, 
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except httpx.RequestError as e:
            print(f'Request failed: {e}')
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            print(f'Unexpected error: {e}')
            import traceback
            print(f'Traceback: {traceback.format_exc()}')
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, path):
        print('Put Request Received')

        try:
            auth_service_url = os.getenv('AUTH_SERVICE_URL')
            forward_url = f'{auth_service_url}/{path}'
            headers = dict(request.headers)
            if 'Content-Length' in headers:
                del headers['Content-Length']
            
            print('Headers before forwarding:', headers)
            
            if 'image' in request.FILES:
                files = {'image': request.FILES['image']}
                response = self.session.put(
                    forward_url, 
                    headers=headers, 
                    files=files,
                    timeout=30
                )
            else:
                response = self.session.put(
                    forward_url, 
                    headers=headers, 
                    json=request.data,
                    timeout=30
                )

            print('Headers after receiving response:', response.headers)
            return Response(response.json(), status=response.status_code)
            
        except httpx.TimeoutException as e:
            print(f'Request timed out: {e}')
            return Response(
                {'error': 'Request to auth service timed out'}, 
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except httpx.RequestError as e:
            print(f'Request failed: {e}')
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            print(f'Unexpected error: {e}')
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class MediaFilesProxy(APIView):
    def get(self, request, path):
        media_service_url = os.getenv('MEDIA_SERVICE_URL')
        # Remove any leading/trailing slashes to avoid doubles
        clean_path = path.strip('/')
        media_url = f"{media_service_url.rstrip('/')}/media/{clean_path}"

        try:
            with httpx.Client() as client:
                response = client.get(media_url)
                
                if response.status_code == 200:
                    content_type = response.headers.get("content-type", "application/octet-stream")
                    return HttpResponse(response.content, content_type=content_type)
                else:
                    print(f"Media request failed: {media_url} with status {response.status_code}")  # Add logging
                    return Response({"error": "File not found"}, status=response.status_code)

        except httpx.RequestError as e:
            print(f"Media request error: {str(e)}")  # Add logging
            return Response({"error": f"Service unavailable: {str(e)}"}, status=503)
        
        
# class AdminService(APIView):

#     session = httpx.Client()

#     def get(self, request, path):
#         print('GET request received for admin-side')
#         print('path here', path)
#         user_id = request.GET.get('id')
#         print(user_id)

#         try:
#             headers = dict(request.headers)

#             if 'Content-Length' in headers:
#                 del headers['Content-Length']

#             admin_service_url = os.getenv('ADMIN_SERVICE_URL')
#             forward_url = f'{admin_service_url}/{path}'

#             with httpx.Client() as client:
#                 response = client.get(forward_url, headers=headers, params=request.GET)

#             return Response(response.json(), status=response.status_code)

#         except httpx.RequestError as e:
#             return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

#     def post(self, request, path):
#         print('POST request received for admin-side')

#         try:
#             admin_service_url = os.getenv('ADMIN_SERVICE_URL')
#             forward_url = f'{admin_service_url}/{path}'
#             headers = dict(request.headers)

#             # Remove 'Content-Length' to avoid issues
#             if 'Content-Length' in headers:
#                 del headers['Content-Length']

#             # Use session to manage cookies across requests
#             response = self.session.post(forward_url, headers=headers, json=request.data)

#             # Check if there's a 'set-cookie' header in the response
#             set_cookie_header = response.headers.get('set-cookie')
#             print('Admin POST response headers:', response.headers)

#             # Prepare the response to return to the frontend
#             response_data = response.json()
#             status_code = response.status_code

#             # Create the response to be returned
#             django_response = Response(response_data, status=status_code)

#             # If 'set-cookie' is present, set it in the outgoing response
#             if set_cookie_header:
#                 # Extract the cookie value (e.g., 'csrftoken=CFeXfO6dfJztMwSegRjKYOeYou3B2AcF; ...')
#                 cookie_value = set_cookie_header.split(';')[0]
#                 cookie_name, cookie_value = cookie_value.split('=')

#                 # Add the cookie to the Django response
#                 django_response.set_cookie(
#                     key=cookie_name,
#                     value=cookie_value,
#                     max_age=31449600,  # One year
#                     path='/',
#                     samesite='Lax',
#                 )

#             return django_response

#         except httpx.RequestError as e:
#             return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)



class AdminService(APIView):
    TIMEOUT_SECONDS = 30.0
    MAX_RETRIES = 3
    BACKOFF_FACTOR = 0.5

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.session = httpx.Client(
            timeout=httpx.Timeout(
                connect=5.0,
                read=self.TIMEOUT_SECONDS,
                write=self.TIMEOUT_SECONDS,
                pool=None
            ),
            limits=httpx.Limits(
                max_keepalive_connections=5,
                max_connections=10,
                keepalive_expiry=5.0
            )
        )

    def get(self, request, path):
        logger.info(f"GET request received for admin-side: {path}")
        print(f"GET request received for path: {path}")
        print(f"Request headers: {dict(request.headers)}")

        try:
            headers = self._prepare_headers(request.headers)
            admin_service_url = os.getenv('ADMIN_SERVICE_URL')
            forward_url = f'{admin_service_url}/{path}'
            
            logger.debug(f"Forwarding GET request to: {forward_url}")
            print(f"Forwarding to URL: {forward_url}")
            print(f"Headers being sent: {headers}")

            response = self.session.get(
                forward_url,
                headers=headers,
                params=request.GET,
                timeout=self.TIMEOUT_SECONDS
            )

            logger.info(f"GET request successful. Status code: {response.status_code}")
            return Response(response.json(), status=response.status_code)

        except httpx.TimeoutException as e:
            logger.error(f"Timeout error in GET request: {str(e)}")
            return Response(
                {'error': 'Request timed out', 'details': str(e)},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except httpx.RequestError as e:
            logger.error(f"Request error in GET request: {str(e)}")
            return Response(
                {'error': 'Gateway error', 'details': str(e)},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            logger.exception(f"Unexpected error in GET request: {str(e)}")
            return Response(
                {'error': 'Internal server error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, path):
        logger.info(f"POST request received for admin-side: {path}")
        print(f"POST request received for path: {path}")
        print(f"Request headers: {dict(request.headers)}")
        print(f"Request data: {request.data}")
        
        try:
            admin_service_url = os.getenv('ADMIN_SERVICE_URL')
            forward_url = f'{admin_service_url}/{path}'
            headers = self._prepare_headers(request.headers)

            logger.debug(f"Forwarding to URL: {forward_url}")
            logger.debug(f"Headers being sent: {headers}")
            logger.debug(f"Request data: {request.data}")

            response = self._make_request_with_retry(
                method='POST',
                url=forward_url,
                headers=headers,
                json=request.data
            )

            logger.info(f"POST request successful. Status code: {response.status_code}")
            print(f"Response status: {response.status_code}")
            print(f"Response headers: {dict(response.headers)}")

            django_response = self._prepare_response(response)
            return django_response

        except httpx.TimeoutException as e:
            logger.error(f"Timeout error in POST request: {str(e)}")
            return Response(
                {'error': 'Request timed out', 'details': str(e)},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except httpx.RequestError as e:
            logger.error(f"Request error in POST request: {str(e)}")
            return Response(
                {'error': 'Gateway error', 'details': str(e)},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            logger.exception(f"Unexpected error in POST request: {str(e)}")
            print(f"Unexpected error: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return Response(
                {'error': 'Internal server error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _make_request_with_retry(self, method, url, **kwargs):
        """Make request with retry logic"""
        for attempt in range(self.MAX_RETRIES):
            try:
                response = self.session.request(
                    method,
                    url,
                    timeout=self.TIMEOUT_SECONDS,
                    **kwargs
                )
                response.raise_for_status()
                return response
            except (httpx.TimeoutException, httpx.RequestError) as e:
                if attempt == self.MAX_RETRIES - 1:  # Last attempt
                    raise
                logger.warning(f"Request attempt {attempt + 1} failed: {str(e)}")
                time.sleep(self.BACKOFF_FACTOR * (2 ** attempt))

    def _prepare_headers(self, headers):
        """Prepare headers for forwarding"""
        headers = dict(headers)
        
        # Remove problematic headers
        headers.pop('Content-Length', None)
        headers.pop('Host', None)
        
        # Handle CSRF token
        csrf_token = headers.get('X-CSRFToken') or headers.get('csrftoken')
        if not csrf_token and 'cookie' in headers:
            # Try to extract from cookie
            cookies = headers['cookie'].split('; ')
            for cookie in cookies:
                if cookie.startswith('csrftoken='):
                    csrf_token = cookie.split('=')[1]
                    break
        
        if csrf_token:
            headers['X-CSRFToken'] = csrf_token
            print(f"Found and forwarding CSRF token: {csrf_token[:10]}...")
            logger.debug(f"Forwarding CSRF token: {csrf_token[:10]}...")

        # Ensure Authorization header is preserved
        if 'Authorization' in headers:
            print("Found and forwarding Authorization header")
            logger.debug("Forwarding Authorization header")

        return headers

    def _prepare_response(self, response):
        """Prepare response with cookies and headers"""
        try:
            response_data = response.json()
        except ValueError:
            logger.warning("Response could not be parsed as JSON")
            print("Response could not be parsed as JSON")
            response_data = {'message': 'Invalid JSON response'}

        django_response = Response(response_data, status=response.status_code)

        # Handle cookies
        set_cookie_headers = response.headers.get_list('set-cookie')
        if set_cookie_headers:
            print(f"Found cookies to set: {set_cookie_headers}")
            for cookie in set_cookie_headers:
                try:
                    cookie_parts = cookie.split(';')[0].split('=')
                    if len(cookie_parts) == 2:
                        cookie_name, cookie_value = cookie_parts
                        print(f"Setting cookie: {cookie_name}={cookie_value[:10]}...")
                        
                        if cookie_value == '':
                            django_response.delete_cookie(
                                key=cookie_name,
                                path='/',
                                samesite='Lax'
                            )
                        else:
                            django_response.set_cookie(
                                key=cookie_name,
                                value=cookie_value,
                                max_age=31449600,  # One year
                                path='/',
                                samesite='Lax',
                                secure=settings.SESSION_COOKIE_SECURE,
                                httponly=settings.SESSION_COOKIE_HTTPONLY if 'csrf' not in cookie_name.lower() else False
                            )
                except Exception as e:
                    logger.error(f"Error setting cookie: {str(e)}")
                    print(f"Cookie parsing error: {str(e)}")
                    continue

        return django_response

    def __del__(self):
        """Cleanup method to close the session"""
        if hasattr(self, 'session'):
            self.session.close()
            
class ContentMicroservice(APIView):
    # Configure timeout and limits
    TIMEOUT_SECONDS = 30.0
    MAX_RETRIES = 3
    BACKOFF_FACTOR = 0.5

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Configure httpx client with timeout and limits
        self.session = httpx.Client(
            timeout=httpx.Timeout(
                connect=5.0,
                read=self.TIMEOUT_SECONDS,
                write=self.TIMEOUT_SECONDS,
                pool=None
            ),
            limits=httpx.Limits(
                max_keepalive_connections=5,
                max_connections=10,
                keepalive_expiry=5.0
            )
        )

    def _prepare_headers(self, headers):
        headers_dict = dict(headers)
        if 'Content-Length' in headers_dict:
            del headers_dict['Content-Length']
        return headers_dict

    def get(self, request, path):
        logger.info(f"GET request received for content service: {path}")
        
        try:
            headers = self._prepare_headers(request.headers)
            content_service_url = os.getenv('CONTENT_SERVICE_URL')
            forward_url = f'{content_service_url}/{path}'
            
            logger.debug(f"Forwarding GET request to: {forward_url}")
            logger.debug(f"Request headers: {headers}")
            
            with httpx.Client(
                timeout=httpx.Timeout(self.TIMEOUT_SECONDS)
            ) as client:
                response = client.get(
                    forward_url,
                    headers=headers,
                    params=request.GET,
                    timeout=self.TIMEOUT_SECONDS
                )

            logger.info(f"GET request successful. Status code: {response.status_code}")
            return Response(response.json(), status=response.status_code)

        except httpx.TimeoutException as e:
            logger.error(f"Timeout error in GET request: {str(e)}")
            return Response(
                {'error': 'Request timed out', 'details': str(e)},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except httpx.RequestError as e:
            logger.error(f"Request error in GET request: {str(e)}")
            return Response(
                {'error': 'Gateway error', 'details': str(e)},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            logger.exception(f"Unexpected error in GET request: {str(e)}")
            return Response(
                {'error': 'Internal server error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, path):
        logger.info(f"POST request received for content service: {path}")
        
        try:
            headers = self._prepare_headers(request.headers)
            content_service_url = os.getenv('CONTENT_SERVICE_URL')
            forward_url = f'{content_service_url}/{path}'
            
            logger.debug(f"Forwarding POST request to: {forward_url}")
            
            response = self.session.post(
                forward_url,
                headers=headers,
                json=request.data,
                timeout=self.TIMEOUT_SECONDS
            )

            set_cookie_header = response.headers.get('set-cookie')
            logger.debug(f"Response headers: {response.headers}")

            response_data = response.json()
            status_code = response.status_code

            django_response = Response(response_data, status=status_code)

            if set_cookie_header:
                cookie_value = set_cookie_header.split(';')[0]
                cookie_name, cookie_value = cookie_value.split('=')
                django_response.set_cookie(
                    key=cookie_name,
                    value=cookie_value,
                    max_age=31449600,
                    path='/',
                    samesite='Lax',
                )

            return django_response

        except httpx.TimeoutException as e:
            logger.error(f"Timeout error in POST request: {str(e)}")
            return Response(
                {'error': 'Request timed out', 'details': str(e)},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except httpx.RequestError as e:
            logger.error(f"Request error in POST request: {str(e)}")
            return Response(
                {'error': 'Gateway error', 'details': str(e)},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            logger.exception(f"Unexpected error in POST request: {str(e)}")
            return Response(
                {'error': 'Internal server error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, path):
        logger.info(f"PUT request received for content service: {path}")
        
        try:
            headers = self._prepare_headers(request.headers)
            content_service_url = os.getenv('CONTENT_SERVICE_URL')
            forward_url = f'{content_service_url}/{path}'
            
            logger.debug(f"Forwarding PUT request to: {forward_url}")

            if 'video' in request.FILES:
                files = {'video': request.FILES['video']}
                response = self.session.put(
                    forward_url,
                    headers=headers,
                    files=files,
                    timeout=self.TIMEOUT_SECONDS
                )
            else:
                response = self.session.put(
                    forward_url,
                    headers=headers,
                    json=request.data,
                    timeout=self.TIMEOUT_SECONDS
                )

            logger.debug(f"Response headers: {response.headers}")
            return Response(response.json(), status=response.status_code)

        except httpx.TimeoutException as e:
            logger.error(f"Timeout error in PUT request: {str(e)}")
            return Response(
                {'error': 'Request timed out', 'details': str(e)},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except httpx.RequestError as e:
            logger.error(f"Request error in PUT request: {str(e)}")
            return Response(
                {'error': 'Gateway error', 'details': str(e)},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            logger.exception(f"Unexpected error in PUT request: {str(e)}")
            return Response(
                {'error': 'Internal server error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class ConnectionMicroserviceView(APIView):
    session = httpx.Client()
    
    def get(self, request, path):
        print('GET request received for communication service')
        
        try:
            print('request header from communication', request.headers, request.GET)
            headers = dict(request.headers)
            if 'Content-Length' in headers:
                del headers['Content-Length']
            
            content_service_url = os.getenv('CONNECTION_SERVICE_URL')
            forward_url = f'{content_service_url}/{path}'
            
            with httpx.Client() as client:
                response = client.get(forward_url, headers=headers, params=request.GET)
            
            return Response(response.json(), status=response.status_code)
            
        except httpx.RequestError as e:
            print(f'Request failed: {e}')
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
    
    def post(self, request, path):
        print('POST request received for communication service')
        
        try:
            content_service_url = os.getenv('CONNECTION_SERVICE_URL')
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
        print('PUT request received for communication service')
        
        try:
            content_service_url = os.getenv('CONNECTION_SERVICE_URL')
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
    # Configure timeout and limits
    TIMEOUT_SECONDS = 30.0
    MAX_RETRIES = 3
    BACKOFF_FACTOR = 0.5

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.session = httpx.Client(
            timeout=httpx.Timeout(
                connect=5.0,
                read=self.TIMEOUT_SECONDS,
                write=self.TIMEOUT_SECONDS,
                pool=None
            ),
            limits=httpx.Limits(
                max_keepalive_connections=5,
                max_connections=10,
                keepalive_expiry=5.0
            )
        )

    def _prepare_headers(self, headers):
        headers_dict = dict(headers)
        if 'Content-Length' in headers_dict:
            del headers_dict['Content-Length']
        return headers_dict

    def get(self, request, path):
        logger.info(f"GET request received for friends service: {path}")
        user_id = request.GET.get('id')
        logger.debug(f"User ID: {user_id}")

        try:
            headers = self._prepare_headers(request.headers)
            friends_service_url = os.getenv('FRIENDS_SERVICE_URL')
            forward_url = f'{friends_service_url}/{path}'
            
            logger.debug(f"Forwarding GET request to: {forward_url}")
            
            with httpx.Client(
                timeout=httpx.Timeout(self.TIMEOUT_SECONDS)
            ) as client:
                response = client.get(
                    forward_url,
                    headers=headers,
                    params=request.GET,
                    timeout=self.TIMEOUT_SECONDS
                )
                
            logger.debug(f"Response Content: {response.content}")
            return Response(response.json(), status=response.status_code)

        except httpx.TimeoutException as e:
            logger.error(f"Timeout error in GET request: {str(e)}")
            return Response(
                {'error': 'Request timed out', 'details': str(e)},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except httpx.RequestError as e:
            logger.error(f"Request error in GET request: {str(e)}")
            return Response(
                {'error': 'Gateway error', 'details': str(e)},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            logger.exception(f"Unexpected error in GET request: {str(e)}")
            return Response(
                {'error': 'Internal server error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, path):
        logger.info(f"POST request received for friends service: {path}")
        
        try:
            headers = self._prepare_headers(request.headers)
            friends_service_url = os.getenv('FRIENDS_SERVICE_URL')
            forward_url = f'{friends_service_url}/{path}'
            
            logger.debug(f"Forwarding POST request to: {forward_url}")
            
            response = self.session.post(
                forward_url,
                headers=headers,
                json=request.data,
                timeout=self.TIMEOUT_SECONDS
            )

            response_data = response.json()
            status_code = response.status_code
            
            logger.debug(f"Friends POST response headers: {response.headers}")
            
            django_response = Response(response_data, status=status_code)

            set_cookie_header = response.headers.get('set-cookie')
            if set_cookie_header:
                cookie_value = set_cookie_header.split(';')[0]
                cookie_name, cookie_value = cookie_value.split('=')
                django_response.set_cookie(
                    key=cookie_name,
                    value=cookie_value,
                    max_age=31449600,
                    path='/',
                    samesite='Lax',
                )

            return django_response

        except httpx.TimeoutException as e:
            logger.error(f"Timeout error in POST request: {str(e)}")
            return Response(
                {'error': 'Request timed out', 'details': str(e)},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except httpx.RequestError as e:
            logger.error(f"Request error in POST request: {str(e)}")
            return Response(
                {'error': 'Gateway error', 'details': str(e)},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            logger.exception(f"Unexpected error in POST request: {str(e)}")
            return Response(
                {'error': 'Internal server error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, path):
        logger.info(f"DELETE request received for friends service: {path}")
        
        try:
            headers = self._prepare_headers(request.headers)
            friends_service_url = os.getenv('FRIENDS_SERVICE_URL')
            forward_url = f'{friends_service_url}/{path}'
            
            logger.debug(f"Forwarding DELETE request to: {forward_url}")
            
            response = self.session.delete(
                forward_url,
                headers=headers,
                params=request.GET,
                timeout=self.TIMEOUT_SECONDS
            )

            response_data = response.json()
            status_code = response.status_code
            
            django_response = Response(response_data, status=status_code)

            set_cookie_header = response.headers.get('set-cookie')
            if set_cookie_header:
                cookie_value = set_cookie_header.split(';')[0]
                cookie_name, cookie_value = cookie_value.split('=')
                django_response.set_cookie(
                    key=cookie_name,
                    value=cookie_value,
                    max_age=31449600,
                    path='/',
                    samesite='Lax',
                )

            return django_response

        except httpx.TimeoutException as e:
            logger.error(f"Timeout error in DELETE request: {str(e)}")
            return Response(
                {'error': 'Request timed out', 'details': str(e)},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except httpx.RequestError as e:
            logger.error(f"Request error in DELETE request: {str(e)}")
            return Response(
                {'error': 'Gateway error', 'details': str(e)},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            logger.exception(f"Unexpected error in DELETE request: {str(e)}")
            return Response(
                {'error': 'Internal server error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )