import os
import numpy as np
import json
import csv
import numpy as np





class PE:
    def __init__(self,pe_number, parent_dir, r, c, modules):
        self.p_num = pe_number
        self.n_cycle=0

        # ファイルオープン
        csv_path = os.path.join(parent_dir,f'test{r}_{c}.csv')
        with open(csv_path, mode='r', newline='', encoding='utf-8') as file:
            reader = csv.reader(file)
            r_c=[]
            for row in reader:
                r_c.append(row[1:modules+1])
                self.n_cycle+=1    
            row_column = np.array(r_c, dtype=str)   # n_cycle * modules
            row_column = row_column.transpose()  # 転置 modules * n_cycle
            for mod in range(modules):
                setattr(self, f"module{mod+1}",row_column[mod])   # モジュールごとにattributeを作成  self.module1, self.module2, self.module3,,,

    def get_n_cycle(self):
        return self.n_cycle
    
    def view_cycles(self,md_num):
        return getattr( self,f"module{md_num}" )
    
    def view_cell(self,md_num,frame_num):
        return getattr( self,f"module{md_num}")[frame_num] 
    




def create_frames(pe_array,n_cycle,modules,side):
    frames_init=[]   # フレームを格納する3次元配列 フレーム数*pe個数*9modules
    for cycle in range(n_cycle):
        frame=[]
        for r in range(side):
            for c in range(side):
                bundle_modules=[]
                for n in range(1,modules+1):
                    bundle_modules.append( pe_array[r][c][f"PE{r}_{c}"].view_cell(n,cycle) )
                frame.append(bundle_modules)
        frames_init.append(frame)
    return frames_init


def cal_each_module_oc_rate(n_cycle,side,modules,pe_array,target_index):
    # 各PEの各モジュールの稼働率を格納する辞書 を格納する行列
    oc_rate_init = np.array( [ [ {f"PE{i}_{j}":[None for n in range(modules)]}  for j in range(side) ] for i in range(side) ], dtype=object )
    # oc_rate_init=[
    #     [{"pe0_0":[module1の稼働率,module2の稼働率,,,]} , {"pe0_1":[module1の稼働率,module2の稼働率,,,]} ,,,]  
    #     [{"pe1_0":[module1の稼働率,module2の稼働率,,,]} , {"pe1_1":[module1の稼働率,module2の稼働率,,,]} ,,,]
    #     [,,,                    ]
    #     [,,,                    ]]
    for r in range(side):
        for c in range(side):
            for mo in range(1,modules+1):
                vl=0
                for cy in range(n_cycle):
                    if(pe_array[r][c][f"PE{r}_{c}"].view_cell(mo,cy)!="Wait"):
                        vl+=1
                oc_rate_init[r][c][f"PE{r}_{c}"][mo-1] = round(vl/n_cycle*100,2)
    return oc_rate_init


def cal_average_median_variance(each_module_oc_rate,target_index):
    average,median,variance = 0,0,0
    target = target_index
    values = []
    for row in each_module_oc_rate:
        for module_dict in row:
            for module_values in module_dict.values():
                if len(module_values) > target:
                    values.append(module_values[target])
    if values:
        average = round(np.mean(values),2)
        median = round(np.median(values),2)
        variance = round(np.var(values),2)
        # print(f"平均値: {average}")
        # print(f"中央値: {median}")
        # print(f"分散値: {variance}")
    return average,median,variance


def cal_layer_cycle(side,pe_array,cycle_data,target_index):
    traversal_layers = {}
    for r in range(side):
        for c in range(side):
            pe_name = f"PE{r}_{c}"
            traversal_layers[pe_name] = []
            module_data = pe_array[r][c][pe_name].view_cycles(target_index)  
            start_index = 0
            for depth, cycles in cycle_data.items():
                end_index = start_index + cycles
                active_cycles = sum(1 for i in range(start_index, end_index) if module_data[i] != "Wait")
                traversal_layers[pe_name].append(active_cycles)
                start_index = end_index
    return traversal_layers



def main():
    scale = int(input("scale:"))
    side = int(input("PE行列の行(列)数:"))
    modules = int(input("モジュール数:"))
    anm_flag = str(input("アニメーションのためのファイルを作成しますか？（T/F）:"))
    target_index = int(input("データをとるモジュールindex(1~):"))
    layer_flag = 1
    try:
        cycle_count_at_each_depth = list(map(int, input("各深さのサイクル数をカンマ区切りで入力してください（例: 25,389,2668,841,34）（わからない場合はそのままEnter）: ").split(',')))
    except ValueError as e:
        cycle_count_at_each_depth = []
        layer_flag = 0
    print("分析中...")

    parent_dir = os.path.abspath(os.path.join(os.getcwd(), '..'))

    ################################################################################################

    # 辞書式配列{pe名:peインスタンス} を各要素にもつ行列 
    pe_array = np.array( [[{f"PE{i}_{j}":PE(f"PE{i}_{j}", parent_dir, i, j, modules)}  for j in range(side)] for i in range(side)], dtype=object )
    # pe_array=[
    #     [{"pe0_0":pe0_0インスタンス},{"pe0_1":pe0_1インスタンス},,,]  
    #     [{"pe1_0":pe1_0インスタンス},{"pe1_1":pe1_1インスタンス},,,,,,,,,,]
    #     [,,,                    ]
    #     [,,,                    ]]
    # print("pe_array",pe_array)
    # a,b,c,d = 参照したいPEの行,列,モジュール,サイクル番号
    a,b,c,d=0,1,2,2
    #print(f"pe_array[{a}][{b}]の{c}モジュール" , pe_array[a][b][f"PE{a}_{b}"].view_cycles(c))
    #print(f"pe_array[{a}][{b}]の{c}モジュール {d}サイクル目" , pe_array[a][b][f"PE{a}_{b}"].view_cell(c,d))

    n_cycle = pe_array[0][0]["PE0_0"].get_n_cycle()

    ################################################################################################

    # フレームファイル作成
    if(anm_flag=="T"):
        frames = create_frames(pe_array,n_cycle,modules,side)
        with open('data/frames.json', 'w') as f:
            json.dump(frames,f)



    #  各PE, 各モジュールの稼働率データファイル作成      array→2次元リスト的な（json）→concatで1次元リスト
    each_module_oc_rate = cal_each_module_oc_rate(n_cycle,side,modules,pe_array,target_index-1)
    data_to_save = {}
    for i, outer_list in enumerate(each_module_oc_rate):
        for j, module_dict in enumerate(outer_list):
            for key, value in module_dict.items():
                data_to_save[key] = value
    with open('data/each_module_oc_rate.json', 'w') as json_file:
        json.dump(data_to_save, json_file, indent=4)


    
    # 情報ファイル作成
    node_per_pe = f"{round((2**scale)/(side*side),2):.2f}"
    average,median,variance = cal_average_median_variance(each_module_oc_rate,target_index-1)
    
    if layer_flag == 0:
        cycle_count_at_each_depth = {f"l{idx+1}_cycle": 99999 for idx in range(100)}
    else:
        cycle_count_at_each_depth = {f"l{idx+1}_cycle": value for idx, value in enumerate(cycle_count_at_each_depth)}

    info = {"scale":scale,"side":side,"modules":modules,"node_per_pe":node_per_pe,"target_module_index":target_index,"average":average,"median":median,"variance":variance} 
    info.update(cycle_count_at_each_depth)

    with open('data/info.json', 'w') as f:
        json.dump(info,f)



    # 各PEごとの深さごとの稼働サイクルを計算
    # info.jsonから "l1_cycle" ~ "l{n}_cycle" の値をフェッチ
    info_path = os.path.join('data', 'info.json')
    with open(info_path, 'r', encoding='utf-8') as f:
        info_data = json.load(f)
    cycle_data = {key: value for key, value in info_data.items() if key.startswith('l') and key.endswith('_cycle')}

    if layer_flag != 0:
        traversal_layers = cal_layer_cycle(side,pe_array,cycle_data,target_index)
        output_path = os.path.join('data', 'traversal_layers.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(traversal_layers, f, indent=4)





    print("完了しました")





if __name__ == "__main__":
    main()







