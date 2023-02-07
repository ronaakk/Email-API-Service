// Every time the page is loaded, 
document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector(".email-view").style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function send_email(event) {

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  console.log(recipients, subject, body)
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json())
    .then(result => {
      if ("message" in result) {
          // The email was sent successfully
          console.log(result["message"])
          load_mailbox('sent');
      }
      else {
        // if error message in json response
        console.log(result)
        console.log(error)
      }
    })
    .catch(error => console.log(error)
    );

    // To prevent the page from refreshing or redirecting
    event.preventDefault();
}
      
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector(".email-view").style.display = 'none';

  // Clearing the other mailboxes
  document.querySelector(".email-view").innerHTML = ''

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    emails.forEach(email => {
      // Where the email info will be put into
      const emaildiv = document.createElement('div');

      // For styling purposes
      emaildiv.classList.add('email-div');

      // Getting all info from the email
      const sender = document.createElement('div')
      sender.innerHTML = `<strong>From:</strong> ${email['sender']}`;
  
      const timestamp = document.createElement('div')
      timestamp.innerHTML = email['timestamp'];

      const recipients = document.createElement('div')
      recipients.innerHTML = `<strong>To:</strong> ${email['recipients']}`;
  
      const subject = document.createElement('div')

      if (email['subject'] === '') {
        subject.innerHTML = '';
      } else {
        subject.innerHTML = `<strong>Subject:</strong> ${email['subject']}`;
      }

      // Making the sent page display 'To:' instead of 'From:'
      if (email["read"] === true && mailbox !== "sent") {
        emaildiv.style.backgroundColor = 'lightgray';
        emaildiv.append(sender,subject,timestamp);
      } 
      if (mailbox === "sent") {
        emaildiv.append(recipients, subject, timestamp);
        // We don't care on our end if the sent email is read or not
        emaildiv.style.backgroundColor = 'white';
      }
      if (mailbox === "inbox" && email['read'] === false) {
        emaildiv.append(sender, subject, timestamp);
        emaildiv.style.backgroundColor = 'white';
      }
  
      document.querySelector('#emails-view').append(emaildiv);

       // To allow users to view emails on a click
       emaildiv.addEventListener('click', () => view_email(email["id"], mailbox));

    })

  })
  .catch(error => console.log(error))
}   

// Figure out how to clear the view page every time you leave it
function view_email(email_id, mailbox) {
  
  document.querySelector("#compose-view").style.display = 'none';
  document.querySelector("#emails-view").style.display = 'none';
  document.querySelector(".email-view").style.display = 'block';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);

    // The div the email details will be added to 
    const element = document.createElement('div')
    element.classList.add('email')
    
    const sender = document.createElement('div')
    sender.innerHTML = `<strong>From:</strong> ${email['sender']}`;

    const timestamp = document.createElement('div')
    timestamp.classList.add('timestamp')
    timestamp.innerHTML = `<i>${email['timestamp']}</i>`;

    const subject = document.createElement('div')
    if (email['subject'] === '') {
      email['subject'] = 'None'
    }
    subject.innerHTML = `<strong>Subject:</strong> ${email['subject']}`;
    
    const recipients = document.createElement('div')
    recipients.innerHTML = `<strong>To:</strong> ${email['recipients']}`;

    const body = document.createElement('div')
    body.classList.add('body')
    body.innerHTML = email['body'];

    // Archive and Reply buttons
    const archive_button = document.createElement('button');
    const reply_button = document.createElement('button');
    reply_button.classList.add('btn', 'btn-primary', 'reply-button');
    reply_button.innerText = 'Reply';

    if (mailbox === "inbox" && email['archived'] === false) {
      archive_button.classList.add('btn', 'btn-primary');
      archive_button.innerText = 'Archive';
    } else {
      archive_button.classList.add('btn', 'btn-danger');
      archive_button.innerText = 'Unarchive';
    }
    // To allow users to archive/unarchive an email
    archive_button.addEventListener('click', () => archive_email(email['id']));
    // To allow users to reply to an email
    reply_button.addEventListener('click', () => reply_to_email(email['id']));
      
    // Making the sent page display 'To:' instead of 'From:'
    if (mailbox === "inbox") {
      element.append(sender, subject, body, timestamp, reply_button, archive_button)
    } else if (mailbox === "archive") {
      element.append(sender, subject, body, timestamp, reply_button, archive_button)
    } else {
      element.append(recipients, subject, body, timestamp, reply_button)
    }

    // Mark the email as read
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })

    document.querySelector('.email-view').append(element)
  })
  .catch(error => console.log(error));
}

function archive_email(email_id) {

  // Using a GET request to see if the email is archived
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    if (email['archived'] === false) {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      }
    )}
    else {
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      }
    )}
  })
  // Take the user back to their inbox
  .then(() => load_mailbox('inbox'))
  .catch(error => console.log(error));
}

function reply_to_email(email_id) {

  // Show compose view and hide other views
  compose_email();

  // Fill out composition fields using GET request
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {

    document.querySelector('#compose-recipients').value = email["sender"];
    if (email['subject'] === '') {
      email['subject'] = 'No Subject'
    }
    document.querySelector('#compose-subject').value = 
      email["subject"].slice(0,4) === "Re: " ? email["subject"] : "Re: " + email["subject"]
    const pre_body_text =`On ${email["timestamp"]}, ${email["sender"]} wrote: \n \n`;
    document.querySelector("#compose-body").value = pre_body_text + '\n \n' + `${email['body']}` + '\n \n --------------------- \n \n';
    
  })
  .catch(error => console.log(error));
}