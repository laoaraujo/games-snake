function ViewModel() {
    var self = this;

    self.sizeX = 30;
    self.sizeY = 30;

    self.arrX = ko.observableArray();
    self.arrY = ko.observableArray();
    self.direction = ko.observable('r');
    self.directionQueue = ko.observableArray();
    self.score = ko.observable(0);
    self.portal = ko.observable(false);
    self.speed = ko.observable(200);

    self.population = function () {
        for (var i = 0; i < self.sizeX; i++) {
            self.arrX.push(i)
        }
        for (var i = 0; i < self.sizeY; i++) {
            self.arrY.push(i)
        }
    }

    self.getRandomColor = function() {
        var hexadecimais = '0123456789ABCDEF';
        var cor = '#';

        // Pega um número aleatório no array acima
        for (var i = 0; i < 6; i++) {
            //E concatena à variável cor
            cor += hexadecimais[Math.floor(Math.random() * 16)];
        }
        return cor;
    }

    self.snake = ko.observableArray([
        {x:0,y:0},
        {x:1,y:0},
        {x:2,y:0}
    ])
    self.apple = ko.observable(
        {x:10,y:10}
    )
    self.hasSnake = function(x,y){
        var retorno = false;
         ko.utils.arrayForEach(self.snake(),function(item){
            if(item.x == x && item.y == y)
                retorno = true;
        })
        return retorno;
    }
    self.hasApple = function(x,y){
        var retorno = false;
            if (self.apple().x == x && self.apple().y == y)
                retorno = true;
        return retorno;
    }
    self.shuffleApple = function(){
        
        var newx = Math.floor(Math.random() * (self.sizeX - 1)); 
        var newy = Math.floor(Math.random() * (self.sizeY - 1));

        if(!self.hasSnake(newx,newy)){
            self.apple({
                x:newx,
                y:newy
            })
        }else{
            self.shuffleApple();
        }
    }

    self.headSnake = ko.computed(function(){

        return self.snake()[self.snake().length - 1];
    });

    self.loop = function () {
        
        if(self.directionQueue().length)
            self.direction(self.directionQueue.shift())
        
        var hs = self.headSnake();

        switch (self.direction()) {
            case 'r':
                hs = { x: hs.x + 1, y: hs.y };
                break;
            case 'l':
                hs = { x: hs.x - 1, y: hs.y };
                break;
            case 'u':
                hs = { x: hs.x, y: hs.y - 1 };
                break;
            case 'd':
                hs = { x: hs.x, y: hs.y + 1 };
                break;
        }

        if (self.portal()) {
            if (hs.x >= self.sizeX)
                hs = { x: hs.x - self.sizeX, y: hs.y };
            else if (hs.y >= self.sizeY)
                hs = { x: hs.x, y: hs.y - self.sizeY };
            else if (hs.x < 0)
                hs = { x: hs.x + self.sizeX, y: hs.y };
            else if (hs.y < 0)
                hs = { x: hs.x, y: hs.y + self.sizeY };


        }

        if (self.isDead(hs)) {

            self.restart();
            return;
        }

        self.snake.push(hs);

        if (self.hasApple(self.headSnake().x, self.headSnake().y)) {
            self.shuffleApple();
            self.score(self.score() + 10);
            clearInterval(self.timer);
            self.speed(self.speed() - 10); 
            self.timer = setInterval(self.loop, self.speed()); 
        }
        else
            self.snake.shift();
    }

    self.timer = setInterval(self.loop, self.speed()); 

    self.isDead = function(hs){
        return self.hasWall(hs) || self.hasSnake(hs.x, hs.y)
    }

    self.hasWall = function(hs){
        return (hs.x < 0 || hs.y < 0 || hs.x >= self.sizeX || hs.y >= self.sizeY)              
    }

    self.restart = function (){
        self.snake([
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 }
        ]);
        self.shuffleApple();
        self.direction('r');
        self.score(0);
        self.speed(200);
        clearInterval(self.timer);
        self.timer = setInterval(self.loop, self.speed());
        self.directionQueue([]);
    };
      
}

var vm = new ViewModel();

$(function () {
    vm.shuffleApple();
    vm.population();
    ko.applyBindings(vm);

    document.onkeydown = function (e) {
        switch(e.keyCode){
            case 39:
                if(vm.direction() != 'l')
                    vm.directionQueue.push('r')
                break;
            case 37:
                if (vm.direction() != 'r')
                    vm.directionQueue.push('l')
                break;
            case 38:
                if (vm.direction() != 'd')
                    vm.directionQueue.push('u')
                break;
            case 40:
                if (vm.direction() != 'u')
                    vm.directionQueue.push('d')
                break;
        }
        
    }
})