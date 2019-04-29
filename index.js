var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

let colourArray = ["#545454", "#d14341", "#f0528f", "#279ceb", "#049d90", "#4C2A85", "#554640", "#FF6542", "#06D6A0", "#E94F37", "#5C415D", "#EE4B6A", "#DF3B57", "#F5B700", "#04E762", "#00A1E4", "#DC0073", "#34113F"];

const serverStatus = {
  users: {},
  commands: {
    openURL: {
      run: function(url, name) {
        let shellCommand = `start ${url}`
        io.emit('run command', shellCommand, name)
        console.log('open', name)
      }
    },
    muteVol: {
      run: function(url, name) {
        let shellCommand = `$obj = new-object -com wscript.shell
          For ($i = 0; $i -lt 50; $i++){
            $obj.SendKeys([char]174)
            sleep 0.1
          }
        `
        io.emit('run command', shellCommand, name)
      }
    },
    maxVol: {
      run: function(url, name) {
        let shellCommand = `$obj = new-object -com wscript.shell
          For ($i = 0; $i -lt 50; $i++){
            $obj.SendKeys([char]175)
            sleep 0.1
          };
        `
        console.log('max')
        io.emit('run command', shellCommand, name)
      }
    },
    killAPP: {
      run: function(url, name) {
        let shellCommand = `Stop-Process -Name "${url}" -force`
        console.log('max')
        io.emit('run command', shellCommand, name)
      }
    },
    textVoice: {
      run: function(url, name) {
        let shellCommand = `Add-Type -AssemblyName System.speech
            $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
            $speak.Speak("${url}")`
        console.log('max')
        io.emit('run command', shellCommand, name)
      }
    }
  }
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/adminPanel', function(req, res){
  res.sendFile(__dirname + '/panel.html');
});

io.on('connection', function(socket){
  console.log(`user connected: ${socket.id}`);
  socket.on('client online', function(name, ip){
     serverStatus.users[socket.id] = {
      name: name,
      ip: ip,
      style: `2px solid ${colourArray[3]}`,
      background: colourArray[3],
      isHovering: false,
      status: "Online",
      default: "white"
    };
  });

  setInterval(function() {
    socket.emit('update UserList', serverStatus.users);
  }, 1000/2)

  socket.on('command post', function(data) {
    console.log('run')
    serverStatus.commands[data.cmd].run(data.value, data.target)
  })

  socket.on('disconnect', function() {
    console.log(`user disconnected: ${socket.id}`);
    delete serverStatus.users[socket.id]
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
