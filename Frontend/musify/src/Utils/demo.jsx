import Cookies from 'js-cookie'; // You can install this library using `npm install js-cookie`

const getCsrfToken = () => {
  return Cookies.get('csrftoken'); // Adjust this if your CSRF cookie has a different name
};

token = getCsrfToken()
console.log(token);
