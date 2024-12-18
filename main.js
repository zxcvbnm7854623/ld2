class TreasureHuntGame {
    constructor(playerInfo) {
      this.gridSize = 5; // 5x5网格
      this.playerPosition = { x: 0, y: 0 }; // 玩家初始位置
      this.libraryPosition = this.generateRandomPosition(); // 图书馆位置
      this.treasurePosition = this.generateRandomPosition(); // 神庙位置
      this.decodePosition = this.generateRandomPosition(); // 解码位置
      this.gameOver = false;
      this.hasFoundLibrary = false; // 标记玩家是否找到了图书馆
      this.hasDecoded = false; // 标记玩家是否解码
      this.elements = {}; // 存储从 txt 文件加载的元素资料
      this.playerInfo = playerInfo; // 保存玩家信息（昵称、ID等）
    }
  
    // 随机生成一个位置
    generateRandomPosition() {
      let x = Math.floor(Math.random() * this.gridSize);
      let y = Math.floor(Math.random() * this.gridSize);
      return { x, y };
    }
  
    // 更新玩家的状态
    movePlayer(direction) {
      if (this.gameOver) return;
  
      switch (direction) {
        case 'up':
          if (this.playerPosition.y > 0) this.playerPosition.y--;
          break;
        case 'down':
          if (this.playerPosition.y < this.gridSize - 1) this.playerPosition.y++;
          break;
        case 'left':
          if (this.playerPosition.x > 0) this.playerPosition.x--;
          break;
        case 'right':
          if (this.playerPosition.x < this.gridSize - 1) this.playerPosition.x++;
          break;
      }
  
      this.checkForEvents(); // 检查是否触发事件
      this.renderMap(); // 更新地图显示
      this.savePlayerData(); // 更新并保存玩家数据
    }
  
    // 检查是否触发了图书馆或神庙事件
    checkForEvents() {
      // 碰到图书馆
      if (
        this.playerPosition.x === this.libraryPosition.x &&
        this.playerPosition.y === this.libraryPosition.y &&
        !this.hasFoundLibrary
      ) {
        this.hasFoundLibrary = true;
        document.getElementById('status').textContent = this.elements.library || '在古老的图书馆里找到了第一个线索!';
      }
      // 碰到解码位置
      else if (
        this.playerPosition.x === this.decodePosition.x &&
        this.playerPosition.y === this.decodePosition.y
      ) {
        if (this.hasFoundLibrary) {
          document.getElementById('status').textContent = '解码成功! 宝藏在一座古老的神庙中...';
          this.hasDecoded = true;
        } else {
          document.getElementById('status').textContent = '没有线索可以解码!';
        }
      }
      // 碰到神庙
      else if (this.playerPosition.x === this.treasurePosition.x && this.playerPosition.y === this.treasurePosition.y) {
        // 神庙事件触发
        let randomChance = Math.random();
        if (randomChance < 0.5) {
          document.getElementById('status').textContent = this.elements.guard || '糟糕! 遇到了神庙守卫!';
          document.getElementById('restartButton').style.display = 'block'; // 显示重新开始按钮
          this.gameOver = true;
        } else {
          document.getElementById('status').textContent = '找到了一个神秘的箱子...';
          // 如果解码成功并到达神庙，结束游戏
          if (this.hasDecoded && this.playerPosition.x === this.treasurePosition.x && this.playerPosition.y === this.treasurePosition.y) {
            document.getElementById('status').textContent = '恭喜! 你找到了传说中的宝藏!';
            this.gameOver = true;
            document.getElementById('restartButton').style.display = 'block'; // 显示重新开始按钮
          }
        }
      }
    }
  
    // 渲染地图
    renderMap() {
      const mapElement = document.getElementById('map');
      mapElement.innerHTML = ''; // 清空之前的地图
  
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          const cell = document.createElement('div');
          cell.classList.add('cell');
  
          // 如果是玩家位置，添加 "player" 类
          if (this.playerPosition.x === x && this.playerPosition.y === y) {
            cell.classList.add('player');
            cell.textContent = '玩家';
          }
  
          // 如果是图书馆位置，添加 "library" 类
          if (this.libraryPosition.x === x && this.libraryPosition.y === y) {
            cell.classList.add('library');
            cell.textContent = '图书馆';
          }
  
          // 如果是神庙位置，添加 "treasure" 类
          if (this.treasurePosition.x === x && this.treasurePosition.y === y) {
            cell.classList.add('treasure');
            cell.textContent = '神庙';
          }
  
          // 如果是解码位置，添加 "decode" 类
          if (this.decodePosition && this.decodePosition.x === x && this.decodePosition.y === y) {
            cell.classList.add('decode');
            cell.textContent = '解码';
          }
  
          mapElement.appendChild(cell);
        }
      }
    }
  
    // 加载元素数据
    loadElements() {
      fetch('elements.txt')
        .then(response => response.text())
        .then(data => {
          const elements = this.parseElements(data);
          this.elements = elements;
          this.renderMap(); // 渲染地图
        })
        .catch(error => console.error('加载元素失败:', error));
    }
  
    // 解析元素文本
    parseElements(data) {
      const elements = {};
      const lines = data.split("\n");
      lines.forEach(line => {
        const [key, description] = line.split("=");
        if (key && description) {
          elements[key] = description;
        }
      });
      return elements;
    }
  
    // 保存玩家数据到 localStorage
    savePlayerData() {
      const playerData = {
        id: this.playerInfo.id,
        nickname: this.playerInfo.nickname,
        position: this.playerPosition,
        hasFoundLibrary: this.hasFoundLibrary,
        hasDecoded: this.hasDecoded,
      };
      localStorage.setItem('playerInfo', JSON.stringify(playerData));
    }
  }
  
  // 游戏初始化
  let game;
  let playerInfo = JSON.parse(localStorage.getItem('playerInfo')) || { nickname: '游客', id: Date.now() };
  
  // 初始化游戏
  function startGame() {
    // 隐藏开始按钮并显示游戏界面
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('gameInterface').style.display = 'block';
  
    // 创建游戏对象并渲染地图
    game = new TreasureHuntGame(playerInfo);
    game.loadElements(); // 加载元素资料
  
    // 更新玩家信息
    document.getElementById('playerNickname').textContent = game.playerInfo.nickname;
    document.getElementById('playerID').textContent = game.playerInfo.id;
  
    // 监听键盘事件
    document.addEventListener('keydown', (e) => {
      if (game.gameOver) return;
  
      switch (e.key) {
        case 'ArrowUp':
          game.movePlayer('up');
          break;
        case 'ArrowDown':
          game.movePlayer('down');
          break;
        case 'ArrowLeft':
          game.movePlayer('left');
          break;
        case 'ArrowRight':
          game.movePlayer('right');
          break;
      }
    });
  }
  
  // 重新开始游戏
  document.getElementById('startButton').addEventListener('click', startGame);
  
  // 重新开始游戏按钮事件
  document.getElementById('restartButton').addEventListener('click', () => {
    window.location.reload();
  });
  
  // 音乐控制
  let isMusicPlaying = false;
  const backgroundMusic = new Audio('background-music.mp3'); // 假设已经有背景音乐文件
  
  document.getElementById('musicButton').addEventListener('click', () => {
    if (isMusicPlaying) {
      backgroundMusic.pause();
      document.getElementById('musicButton').textContent = '播放音乐';
    } else {
      backgroundMusic.play();
      document.getElementById('musicButton').textContent = '暂停音乐';
    }
    isMusicPlaying = !isMusicPlaying;
  });
  
  // 处理页面加载后的初始化
  window.onload = () => {
    // 如果 localStorage 中有玩家数据，则继续使用这些数据
    if (localStorage.getItem('playerInfo')) {
      playerInfo = JSON.parse(localStorage.getItem('playerInfo'));
      // 更新显示玩家信息
      document.getElementById('playerNickname').textContent = playerInfo.nickname;
      document.getElementById('playerID').textContent = playerInfo.id;
    }
    // 显示开始按钮
    document.getElementById('startButton').style.display = 'block';
  };
  