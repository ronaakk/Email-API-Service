# Email-API-Service

A simple front-end for an email client that makes calls to an API to send and receive emails. Project completed with the use of Python, Javascript, HTML, and CSS.

## Specification 

Users can send and receive mail, as long as the email is registered and the email has a subject line. Users can also archive and unarchive emails that are sent to them, which can be seen under the 'archive' tab.
When a user clicks on an email in any inbox, they will be taken to a view which displays all information regarding the email (sender, the recipients, subject, body, etc.).

Once emails are read, they are updated through an API call which turns the background of an email from white to grey, indicating to the user that they have already viewed that email.

All functionality within this single-page appilication has been done through API calls.

## Usage:

Requires Python(3) and the Python Pacakage Installed (pip) to run:

Install requirements (Django): 
 ```
 pip3 install django
 ```
To download this app, enter the following in your terminal: 
```
git clone https://github.com/ronaakk/Email-API-Service.git
```
Migrate and run the app locally: 
```
python3 manage.py makemigrations mail
python3 manage.py migrate
python3 manage.py runserver
```

