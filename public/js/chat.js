$(function() {
  //init variables
  var $window = $(window);
  var userName;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $message = $('#input');

  //initialize socket.io
  var socket = io();


  //set time stamp on chat window
  $('.chat-time-stamp').empty();
  $('.chat-time-stamp').text(getDateTime);


  //if the user is not logged in, prompt for userName
  //input and log user on server
  if(!userName){
    ShowUserNamePrompt();
  }

  //send message
  $('#sendBtn').click(function(){
    SendMessage();
  });


  //handle login
  function ShowUserNamePrompt(){
    //show login button
    $('#loginBtn').show();
    //show login placeholder label
    $('#input').attr('placeholder', 'Enter Username...');
    //user clicks on login button
    $('#loginBtn').click(function(){
      AddUser();
    });

  };

  //hides login prompt and display chat text message labels and button
  function HideUserNamePrompt(){
    $('#input').val('');
    //hide login button
    $('#loginBtn').hide();
    //show send message button
    $('#sendBtn').show();
    //show send message placeholder label
    $('#input').attr('placeholder', 'Send a message...');
  };

  //handle adding of user to server
  function AddUser(){
    console.log('adding user');
    userName = $('#input').val();
    if(userName){
    //send server the username
    socket.emit('add user', userName);
    //connected flag to true
    connected = true;
    //hides login content
    HideUserNamePrompt();
    //display login name
    $('.user-name').empty();
    $('.user-name').text(userName);
  }
  };

  function SendMessage(){

    var msg = $message.val();
    console.log(msg);
    if(msg && connected){
      //remove input from text box
      $message.val('');
      $message.attr('placeholder', 'Send a message...');
      //call addChatMessage function
      addChatMessage({
       username: userName,
       message: msg
     }, {color: 'FA6F57'});
     // tell server to execute 'new message' and send along one parameter
     socket.emit('new message', msg);

    }

  };




  function addChatMessage (data, options) {
     options = options || {};
     var color = options.color;
     var user = data.username;
     var message = data.message;
     var date = new Date();
     var time = formatAMPM(date);

     //create main list container
     var $rowContainer = $('<div class="row"></div>');

     var $chatMsgBody = $('<div class="col-lg-12"></div>');

     $rowContainer.append($chatMsgBody);

     var $mediaContainer = $('<div class="media"></div>');

     var $linkImgContainer = $('<a class="pull-left" href="#"></a>');
     var $img = $('<img class="media-object img-circle" src="http://placehold.it/45/'+color+'/fff&text='+user.substring(0,1)+'" alt="">');

     $linkImgContainer.append($img);

     $mediaContainer.append($linkImgContainer);

     var $mediaBodyContainer = $('<div class="media-body"></div>');

     var $mediaHeading = $('<h4 class="media-heading">'+user+'</h4>');

     var $timeStamp = $('<span class="small pull-right">'+time+'</span>');

     $mediaHeading.append($timeStamp);

     $mediaBodyContainer.append($mediaHeading);

     var $message = $('<p>'+message+'</p>');

     $mediaBodyContainer.append($message);

     $mediaContainer.append($mediaBodyContainer);

     //append the media container to the chatMsgBody
     $chatMsgBody.append($mediaContainer);

     //append row to chat widget
     $('.chat-widget').append($rowContainer);

     $('.chat-widget').append($('<hr>'));

      //scroll down to the new message
     $('.chat-widget')[0].scrollTop = $('.chat-widget')[0].scrollHeight;

  };

  function addNewUserMessage(data){
    $('#participants').empty();
    $('#participants').text('Logged in participants online: ' + data.numUsers);
  }


  // Whenever the server emits 'current user logged in', log it in the chat body
  socket.on('login', function (data) {
    addNewUserMessage(data);
  });

  // Whenever the server emits 'current user logged in', log it in the chat body
  socket.on('logged users', function (data) {
    addNewUserMessage(data);
  });


  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    addNewUserMessage(data);
  });

  // Whenever the server emits 'left', log it in the chat body
  socket.on('user left', function (data) {
    addNewUserMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
 socket.on('new message', function (data) {
   addChatMessage(data, {color: '6f57fa'});
  });

function getDateTime() {

      var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      var date = new Date();

      var hour = date.getHours();
      hour = (hour < 10 ? "0" : "") + hour;

      var min  = date.getMinutes();
      min = (min < 10 ? "0" : "") + min;

      var sec  = date.getSeconds();
      sec = (sec < 10 ? "0" : "") + sec;

      var year = date.getFullYear();

      var month = date.getMonth() + 1;
      month = (month < 10 ? "0" : "") + month;

      var day  = date.getDate();
      day = (day < 10 ? "0" : "") + day;



      return monthNames[month-1] + " " + day + "," + year;

};

// Keyboard events
$window.keydown(function (event) {

  // When the client hits ENTER on their keyboard
  if (event.which === 13) {
    if (userName) {
      SendMessage();
    }else{
      AddUser();
    }
  }
});

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
};


});
