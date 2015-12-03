
define(['jquery', 'socket.io-client'], function($, io) {
  //private static variables
  var $window = $(window);
  var userName;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $msgbox;
  var socket;

  function Chat() {
    // When defining callbacks you need to preserve the "this" object.
    var self = this;

    //initialize socket.io
    socket = io();

    // Below code handles initializing the GUI

    // chatbox
    $msgbox = this.createMsgBox();
    $(document.body).append($msgbox);

    // set time stamp on chat window
    $('.chat-time-stamp').empty();
    $('.chat-time-stamp').text(getDateTime);

    //if the user is not logged in, prompt for userName
    //input and log user on server
    if(!userName){
      this.ShowUserNamePrompt();
    }

    // Send msg button 
    $('#sendBtn').click(function(){
      this.SendMessage();
    });

    // Keyboard events
    $(document).on("keypress", ".user_inp, .msg_inp", function(e) {
      if (e.which == 13) {
        if (userName) {
          self.SendMessage();
        } else {
          self.AddUser();
        }
        e.preventDefault();
      }
    });


    // Whenever the server emits 'current user logged in', log it in the chat body
    socket.on('login', function (data) {
      self.addNewUserMessage(data);
    });

    // Whenever the server emits 'current user logged in', log it in the chat body
    socket.on('logged users', function (data) {
      self.addNewUserMessage(data);
    });


    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
      self.addNewUserMessage(data);
    });

    // Whenever the server emits 'left', log it in the chat body
    socket.on('user left', function (data) {
      self.addNewUserMessage(data);
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
      self.addChatMessage(data, {color: '6f57fa'});
    });

  };

  Chat.prototype.createMsgBox = function() {
    if($msgbox) return $msgbox;

    // css styles make this appear in bottom right
    $msgbox = $(""+
                "<div class='msgbox'>"+
                  "<div class='adduser'><div class='userinfo'>"+
                    "<input class='user_inp' placeholder='Enter username' />"+
                    "<button class='loginbtn'>Login</button>"+
                  "</div></div>"+
                  "<div class='participants'></div>"+
                  "<div class='msgs'></div>"+
                  "<div class='inp_wrapper'>"+
                    "<input type='text' class='msg_inp' placeholder='Message'>"+
                    "<button type='button' class='msg_send'>Send</button>"+
                "</div>");
    return $msgbox;
  }


  //handle login
  Chat.prototype.ShowUserNamePrompt = function(){
    var self = this;
    $('.adduser').show();

    //user clicks on login button
    $('.loginbtn').click(function(){
      self.AddUser();
    });

  };

  //hides login prompt and display chat text message labels and button
  Chat.prototype.HideUserNamePrompt = function(){
    $('.adduser').hide();

    //show send message placeholder label
    $('.msg_inp').attr('placeholder', 'Send a message...');
  };

  //handle adding of user to server
  Chat.prototype.AddUser = function(){
    console.log('adding user');
    userName = $('.user_inp').val();
    if(userName){
      //send server the username
      socket.emit('add user', userName);
      //connected flag to true
      connected = true;
      //hides login content
      this.HideUserNamePrompt();
      //display login name
      //$('.user-name').empty();
      //$('.user-name').text(userName);
    } else {
      console.log("no username...")
    }
  };

  Chat.prototype.SendMessage = function(){

    var $msginp = $msgbox.find("input.msg_inp");
    var msg = $msginp.val();
    if(msg && connected){
      //remove input from text box
      $msginp.val('');
      $msginp.attr('placeholder', 'Send a message...');
      //call addChatMessage function
      this.addChatMessage({
        username: userName,
        message: msg
      }, {color: 'FA6F57'});
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', msg);

    } else {
      console.log("can't send empty chat message...");
    }
  };


  Chat.prototype.addChatMessage = function(data, options) {
    options = options || {};
    var color = options.color;
    var user = data.username;
    var message = data.message;
    var date = new Date();
    var time = formatAMPM(date);

    var $newmsg = $("<div class='msg'></span></div>")
    $newmsg.text(user + ": " + message);

    var $entries = $msgbox.find(".msgs");
    $entries.append($newmsg);

    //scroll down to the new message
    $('.msgs')[0].scrollTop = $('.msgs')[0].scrollHeight;
  };

  Chat.prototype.addNewUserMessage = function(data){
    $('#participants').empty();
    $('#participants').text(data.numUsers + " players");
  }

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



  return Chat;

});
