document.addEventListener("DOMContentLoaded", () => {
    let side=0;
    let modules=0;



    fetch('../data/info.json')
    .then(response => response.json())
    .then(data => {

        module_list=["1：local_frontier_bitmap", 
            "2：working_fronter",
            "3：extract_vertices_issue_reciever",
            "4：traversal",
            "5：filter_pred_data_issue",
            "6：unvisited",
            "7：filter_pred_data_receiver",
            "8：all_gather",
            "9：all_to_all"]
        console.log(module_list)

        scale = data["scale"];
        const sc = document.querySelector('.sc');
        sc.textContent = `scale${scale}`;
        side = data["side"];
        modules = data["modules"];
        node_per_pe = data["node_per_pe"];
        const ppn = document.querySelector('.ppn');
        ppn.textContent = `1PEあたりの担当ノード数: ${node_per_pe}`;

        // 行列のレイアウトを生成
        const matrixContainer = document.getElementById('matrixContainer');
        function createMatrixLayout(side) {
            matrixContainer.innerHTML = ''; 
            for (let i = 0; i < side * side; i++) {
                const square = document.createElement('div');
                square.classList.add('square');
                const numberGrid = document.createElement('div');
                numberGrid.classList.add('number-grid');
                for (let j = 0; j < modules; j++) {
                    const number = document.createElement('div');
                    number.classList.add('number');
                    number.textContent = `${Math.floor(i / side)},${i % side}`;
                    numberGrid.appendChild(number);
                }
                square.appendChild(numberGrid);
                matrixContainer.appendChild(square);
            }
            //console.log(Math.sqrt(modules));
            // 全ての.number-grid要素を取得し、スタイルを適用
            const allNumberGrids = document.querySelectorAll('.number-grid');
            allNumberGrids.forEach(numberGrid => {
                numberGrid.style.gridTemplateColumns = `repeat(${Math.sqrt(modules)}, 1fr)`;
                numberGrid.style.gridTemplateRows = `repeat(${Math.sqrt(modules)}, 1fr)`;
            });
            matrixContainer.style.gridTemplateColumns = `repeat(${side}, auto)`;
            matrixContainer.style.gridTemplateRows = `repeat(${side}, auto)`;
        }
        createMatrixLayout(side);
    })
    .catch(error => {
        console.error('データの読み込みに失敗しました:', error);
    });





    fetch('../data/each_module_oc_rate.json')
    .then(response => response.json())
    .then(data => {
        // 稼働率表示ボタン
        const ocRateButton = document.getElementById('oc-rate');
        ocRateButton.addEventListener('click', () => {
            // each_oc_data = [
            //     ...data.PE0_0,
            //     ...data.PE0_1,
            //     ...data.PE1_0,
            //     ...data.PE1_1
            // ];
            each_oc_data = [];
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    each_oc_data = each_oc_data.concat(data[key]);
                }
            }
            const numberElements = document.querySelectorAll('.number');
            numberElements.forEach((element, index) => {
                if (each_oc_data[index] !== undefined) {
                    element.textContent = each_oc_data[index];
                }
            });
        });
    })
    .catch(error => {
        console.error('データの読み込みに失敗しました:', error);
    });
    




    fetch('../data/frames.json')
    .then(response => response.json())
    .then(data => {
        let frame = 0;
        const totalFrames = data.length;
        let intervalId; // setInterval IDを保持
        let isPlaying = true; 

        // アニメーションを更新する関数
        function updateFrame(data, frame) {
            const currentFrameData = data[frame];   
            const countDiv = document.querySelector('.count');
            if (countDiv) {
                countDiv.textContent = frame + 1;
            }
            const numberElements = document.querySelectorAll('.number');
            numberElements.forEach((element, index) => {
                const rowIndex = Math.floor(index / modules);
                const colIndex = index % modules;
                if (currentFrameData[rowIndex] && currentFrameData[rowIndex][colIndex] !== undefined) {
                    element.textContent = currentFrameData[rowIndex][colIndex];
                }
            });
        }

        function startAnimation() {
            intervalId = setInterval(() => {
                updateFrame(data, frame);
                frame = (frame + 1) % totalFrames;
            }, 500);
        }

        function stopAnimation() {
            clearInterval(intervalId);
        }

        startAnimation();

        // 再生・一時停止ボタンのクリックイベント
        const toggleButton = document.getElementById('toggle-play');
        toggleButton.addEventListener('click', () => {
            if (isPlaying) {
                stopAnimation();
                toggleButton.textContent = 'Play';
            } else {
                startAnimation();
                toggleButton.textContent = 'Pause';
            }
            isPlaying = !isPlaying;
        });

        // フレームジャンプ機能
        const jumpButton = document.getElementById('jump-button');
        jumpButton.addEventListener('click', () => {
            const frameInput = document.getElementById('frame-input');
            const inputFrame = parseInt(frameInput.value);
            
            // フレームが有効な範囲内か確認
            if (!isNaN(inputFrame) && inputFrame >= 0 && inputFrame < totalFrames) {
                stopAnimation(); // アニメーションを一時停止
                frame = inputFrame - 1; // フレーム番号を設定
                updateFrame(data, frame); // 指定のフレームを表示
            } else {
                alert('無効なフレーム番号です');
            }
        });

        // 1フレーム進むボタン
        const nextFrameButton = document.getElementById('next-frame');
        nextFrameButton.addEventListener('click', () => {
            stopAnimation();
            frame = (frame + 1) % totalFrames; // フレームを進める
            updateFrame(data, frame);
        });

        // 1フレーム戻るボタン
        const prevFrameButton = document.getElementById('prev-frame');
        prevFrameButton.addEventListener('click', () => {
            stopAnimation();
            frame = (frame - 1 + totalFrames) % totalFrames; // フレームを戻す（負の値を防ぐために+totalFramesを使用）
            updateFrame(data, frame);
        });

    })
    .catch(error => {
        console.error('データの読み込みに失敗しました:', error);
    });
});

