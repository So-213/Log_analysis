document.addEventListener("DOMContentLoaded", async () => {

    //色サンプル表示
    const container = document.getElementById('colorContainer');
    for (let hue = 60; hue <= 360; hue += 30) { 
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
        colorBox.textContent = (hue-60)/300;
        container.appendChild(colorBox);
    }



    //情報取得
    let side_n=0;
    let modules=0;
    let target_module_index=0; 
    try {
        const response = await fetch('../../data/info.json');
        const data = await response.json();
        side_n = data["side"];
        modules = data["modules"];
        target_module_index = data["target_module_index"];
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
    }



    //カラーマトリクス表示
    // クエリパラメータからmdlを取得
    const urlParams = new URLSearchParams(window.location.search);
    const intmdl = Number(urlParams.get('module')-1);    //objectの中のmoduleキーに対応する値をNumber型として格納
    //console.log(intmdl);
    fetch('../../data/each_module_oc_rate.json')
    .then(response => response.json())
    .then(data => {
        // 特定のmoduleの値を抽出して2次元配列に変換
        const side = side_n;
        const values = [];
        for (let i = 0; i < side; i++) {
            const row = [];
            for (let j = 0; j < side; j++) {
                const key = `PE${i}_${j}`;
                if (data[key] && data[key][intmdl] !== undefined) {
                    row.push(data[key][intmdl]/100);
                } else {
                    row.push(null); 
                }
            }
            values.push(row);
        }

        function createMatrix(side, values) {
            const matrix = document.createElement('div');
            matrix.className = 'matrix';
            matrix.style.gridTemplateColumns = `repeat(${side}, 1fr)`;
            for (let i = 0; i < side; i++) {
                for (let j = 0; j < side; j++) {
                    const block = document.createElement('div');
                    block.className = 'block';
                    block.id = `PE${i}_${j}`;
                    block.textContent = `${i},${j}`;
                    const value = values[i][j];
                    const hue = 60 + value * (360 - 60);
                    block.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
                    matrix.appendChild(block);
                }
            }
            return matrix;
        }
        console.log(values)
        const matrixElement = createMatrix(side_n, values);
        document.getElementById('matrixContainer').appendChild(matrixElement);    
    })
    .catch(error => {
        console.error('データの読み込みに失敗しました:', error);
    });



    if(intmdl==target_module_index-1){
        // 右側のフォームを作成
        const rightGroup = document.createElement('div');
        rightGroup.className = 'right-group';

        const form = document.createElement('form');
        form.action = '/color/layers';

        const textarea = document.createElement('textarea');
        textarea.name = 'layers';
        textarea.id = 'layers';
        textarea.cols = 30;
        textarea.rows = 1;
        textarea.placeholder = '深さを入力(1~)';

        const button = document.createElement('button');
        button.textContent = '決定';

        // 要素をフォームに追加
        form.appendChild(textarea);     //textareaオブジェクトをformタグに追加
        form.appendChild(button);

        // フォームを右グループに追加
        rightGroup.appendChild(form);

        // .container 内に右グループを追加
        const container = document.querySelector('.container');
        container.appendChild(rightGroup);
    }


});