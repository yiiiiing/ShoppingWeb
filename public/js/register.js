/**
 * TODO: 8.4 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */
 const containerId = "notifications-container";
 const form = document.getElementById('register-form');
 const Name = document.getElementById('name');
 const Email = document.getElementById('email');
 const Password = document.getElementById('password');
 const PasswordConfirmation = document.getElementById('passwordConfirmation');
 var message = "";
 var ifSuccess = false;
 
form.addEventListener('submit', function(event){
     event.preventDefault();
     let passwordValue = Password.value;
     let passwordConfirmationValue = PasswordConfirmation.value;
     let nameValue = Name.value;
     let emailValue = Email.value;    
     if (passwordValue === passwordConfirmationValue)
     {
         ifSuccess = true;
         message = "register successfully"
         
     } 
     else
     {
         ifSuccess = false;
         message = "Password doesn't match password confirmation"
     } 
     createNotification(message,containerId,ifSuccess); 
     if (ifSuccess){
         // reset the form
         form.reset();
         var data = {"name": nameValue, "email": emailValue, "password": passwordValue};
         postOrPutJSON('/api/register', 'POST', data);
     }   
 });


 
 

