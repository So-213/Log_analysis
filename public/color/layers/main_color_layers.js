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



    // クエリパラメータからlayersを取得
    const urlParams = new URLSearchParams(window.location.search);
    const intlayer = Number(urlParams.get('layers'));

    let side_n = 0;
    let modules = 0;
    let particular_layer_ctcle = 0;



    // info.jsonを取得
    try {
        const response = await fetch('../../../data/info.json');
        const data = await response.json();
        side_n = data["side"];
        modules = data["modules"];
        particular_layer_ctcle = data[`l${intlayer}_cycle`]; 
    } catch (error) {
        console.error('info.jsonの読み込みに失敗しました:', error);
        return; 
    }



    // traversal_layers.jsonを取得
    try {
        const response = await fetch('../../../data/traversal_layers.json');
        const data = await response.json();

        // 特定のlayerの値を抽出して2次元配列に変換
        const side = side_n;
        const values = [];
        for (let i = 0; i < side; i++) {
            const row = [];
            for (let j = 0; j < side; j++) {
                const key = `PE${i}_${j}`;
                if (data[key] && data[key][intlayer-1] !== undefined) {
                    row.push(data[key][intlayer-1] / particular_layer_ctcle);
                } else {
                    row.push(null); 
                }
            }
            values.push(row);
        }

        console.log(values);

        // カラーマトリクスを作成
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
                    const hue = 60 + (value || 0) * (360 - 60); // nullの場合はデフォルト値
                    block.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
                    matrix.appendChild(block);
                }
            }
            return matrix;
        }

        const matrixElement = createMatrix(side_n, values);
        document.getElementById('matrixContainer').appendChild(matrixElement);

    } catch (error) {
        console.error('traversal_layers.jsonの読み込みに失敗しました:', error);
    }
});
