const card_list = { "B": 1.5, "A": 1.0, "Q": 0.8 }; //宝具色補正
const correctio_lv90 = { "0": 1.390, "1": 1.508, "2": 1.390, "3": 1.289, "4": 1.126, "5": 1.000 };
const correctio_lv100 = { "0": 1.546, "1": 1.677, "2": 1.546, "3": 1.434, "4": 1.253, "5": 1.112 };
const correctio_lv110 = { "0": 1.703, "1": 1.847, "2": 1.703, "3": 1.579, "4": 1.379, "5": 1.224 };
const correctio_lv120 = { "0": 1.859, "1": 2.016, "2": 1.859, "3": 1.724, "4": 1.506, "5": 1.337 };
let servantList = null;

$(function(){

    const tabRadio = $("*[name=tab-radio]");
    const tabLabel = $(".tab-label");
    const tabNum = tabRadio.length;
    const cover = $("#select-tab-cover")[0];
    const contents = $("#contents")[0];
    let coverX = 100;
    let loopHandler;
    let enableTab = "0";
    
    // ラベルクリック時にスライドアニメーションを実行
    for (let cnt = 0; cnt < tabNum; cnt++) {
        tabLabel[cnt].onclick = () => {
            tabSlideAnim(cnt);
        }
    }
    
    // スライドアニメーション
    const tabSlideAnim = (x) => {
        const loopNum = 32; // アニメーション分割数 (値が大きいほどスライドが速くなる)
        let count = 0;
        const startScroll = contents.scrollLeft;
        const diffScroll = (contents.offsetWidth * x - startScroll);
        contents.style.scrollSnapType = "none"; // スクロールを一時的に無効化
        contents.style.overflowX = "hidden"; // スクロールを一時的に無効化
        cancelAnimationFrame(loopHandler); // 前に実行されていたアニメーションをキャンセル
        const loop = () => {
            if (count < loopNum) {
                count++;
                contents.scrollLeft = startScroll + easeOut(count / loopNum) * diffScroll;
                loopHandler = requestAnimationFrame(loop); // loopを再帰的に呼び出す
            } else {
                contents.style.scrollSnapType = "x mandatory"; // スクロールを有効に戻す
                contents.style.overflowX = "auto"; // スクロールを有効に戻す
                contents.scrollLeft = contents.offsetWidth * x;
            }
        }
        loop();
    }
    
    // スライドを滑らかに止める用の計算
    const easeOut = (p) => {
        return p * (2-p);
    }
    
    contents.onscroll = (e) => {
        // アンダーバーを連動して動かす。
        coverX = 100 * e.target.scrollLeft / contents.offsetWidth;
        cover.style.transform = "translateX(" + coverX + "%)";

        // スクロール量を取得してラジオボタンに反映させる
        if (e.target.scrollLeft < contents.offsetWidth / 2) {
            tabRadio[0].checked = true;
            if (enableTab != "0") {
                // 再計算
                calcMain("0");
                document.activeElement.blur();
            }
            enableTab = "0";
        }
        else if (e.target.scrollLeft < contents.offsetWidth * 3 / 2) {
            tabRadio[1].checked = true;
            if (enableTab != "1") {
                // 再計算
                calcMain("1");
                document.activeElement.blur();
            }
            enableTab = "1";
        }
        else if (e.target.scrollLeft < contents.offsetWidth * 5 / 2) {
            tabRadio[2].checked = true;
            if (enableTab != "2") {
                // 再計算
                calcMain("2");
                document.activeElement.blur();
            }
            enableTab = "2";
        }
        else if (e.target.scrollLeft < contents.offsetWidth * 7 / 2) {
            tabRadio[3].checked = true;
            if (enableTab != "3") {
                // 再計算
                calcMain("3");
            }
            enableTab = "3";
        }
        else {
            tabRadio[4].checked = true;
            if (enableTab != "4") {
                // 再計算
                calcMain("4");
            }
            enableTab = "4";
        }
    }

    /**
     * 表計算フォーカス遷移イベント
     */
     $(document).on("blur", "input", function () {
        var tabNumber = $("input[name='tab-radio']:checked").val();

        setTimeout(function(){
            console.log($(".floating-result")[0].offsetHeight);
        },100);

        // 対象タブを計算
        calcMain(tabNumber);
    });

    /**
     * セレクトボックス変更イベント
     */
     $(document).on("change", ".calc-inp-tbl select", function () {
        var tabNumber = $("input[name='tab-radio']:checked").val();

        // 対象タブを計算
        calcMain(tabNumber);

    });

    /**
     * 撃破率画面表示イベント
     */
    $("#prob-modal").on("show.bs.modal", function () {

        var tabNumber = $("input[name='tab-radio']:checked").val();
        
        // パラメーターを撃破率画面にコピー
        copyProbInput(tabNumber);

        // 撃破率計算
        calcProb();

        return true;

    });

    /**
     * 撃破率フォーカス遷移イベント
     */
     $("#prob-inp-tbl").on("blur", "input", function () {

        // 撃破率計算
        calcProb();

    });

    /**
     * ツール画面表示イベント
     */
     $("#tool-modal").on("show.bs.modal", function () {

        var tabNumber = $("input[name='tab-radio']:checked").val();
        
        // 現在表示のタブを初期値とする
        $("#clear-tab-select").val(tabNumber);

        switch (tabNumber) {
            case "0":
                $("#copy-from").val("0");
                $("#copy-to").val("1");
                break;
            case "1":
                $("#copy-from").val("0");
                $("#copy-to").val(tabNumber);
                break;
            case "2":
                $("#copy-from").val("1");
                $("#copy-to").val(tabNumber);
                break;
            case "3":
                $("#copy-from").val("2");
                $("#copy-to").val(tabNumber);
                break;
            case "4":
                $("#copy-from").val("3");
                $("#copy-to").val(tabNumber);
                break;
            default :
                break;
        }

        return true;

    });

    /**
     * コピーボタン押下イベント
     */
     $("#copy-param").on("click", function () {

        var tabNumber = $("input[name='tab-radio']:checked").val();
        var copy_from = $("#copy-from").val();
        var copy_to = $("#copy-to").val();
        
        // 入力値コピー
        copyParam(copy_from, copy_to);

        // 対象タブを計算
        calcMain(tabNumber);

        // モーダルを閉じる
        $("#tool-modal").modal("hide");

        return true;

    });

    /**
     * クリアボタン押下イベント
     */
    $("#clear-param").on("click", function () {

        var tabNumber = $("#clear-tab-select").val();
        
        // 入力値クリア
        clearParam(tabNumber);

        // モーダルを閉じる
        $("#tool-modal").modal("hide");

        return true;

    });

     /**
     * 詳細設定ボタン押下イベント
     */
    $(document).on("click", ".chevron-double", function() {

        if ($(".chevron-double-down").attr("class").indexOf("d-none") > -1){
            $(".chevron-double-down").removeClass("d-none");
            $(".chevron-double-up").addClass("d-none");
            $(".advanced_setting").addClass("d-none");
        }
        else {
            $(".chevron-double-up").removeClass("d-none");
            $(".chevron-double-down").addClass("d-none");
            $(".advanced_setting").removeClass("d-none");
        }
        
        return false;

    });

    /**
     * サーヴァント検索画面表示イベント
     */
    $("#search-modal").on("show.bs.modal", function () {

        var tabNumber = $("input[name='tab-radio']:checked").val();

        if ($("#search_servant_class_" + tabNumber).val() != "") {
            $("#servant-class").val($("#search_servant_class_" + tabNumber).val());
        }
        if ($("#search_servant_rare_" + tabNumber).val() != "") {
            $("#servant-rare").val($("#search_servant_rare_" + tabNumber).val());
        }
        // サーヴァントセレクトボックスを再作成
        remakeServantSelectBox();
        if ($("#servant_No_" + tabNumber).val() != "") {
            $("#servant-name").val($("#servant_No_" + tabNumber).val());
        }
        if ($("#search_servant_lvl_" + tabNumber).val() != "") {
            switch ($("#search_servant_lvl_" + tabNumber).val()) {
                case "MAX" :
                    $("#radio_lvlMax").prop("checked", true);
                    break;
                case "100" :
                    $("#radio_lvl100").prop("checked", true);
                    break;
                case "110" :
                    $("#radio_lvl110").prop("checked", true);
                    break;
                case "120" :
                    $("#radio_lvl120").prop("checked", true);
                    break;
                default :
                    break;
            } 
        }
        if ($("#search_servant_nplvl_" + tabNumber).val() != "") {
            switch ($("#search_servant_nplvl_" + tabNumber).val()) {
                case "1" :
                    $("#radio_nplvl_1").prop("checked", true);
                    break;
                case "2" :
                    $("#radio_nplvl_2").prop("checked", true);
                    break;
                case "3" :
                    $("#radio_nplvl_3").prop("checked", true);
                    break;
                case "4" :
                    $("#radio_nplvl_4").prop("checked", true);
                    break;
                case "5" :
                    $("#radio_nplvl_5").prop("checked", true);
                    break;
                default :
                    break;
            } 
        }
        if ($("#search_servant_fou_" + tabNumber).val() != "") {
            switch ($("#search_servant_fou_" + tabNumber).val()) {
                case "0" :
                    $("#radio_fou_0").prop("checked", true);
                    break;
                case "1000" :
                    $("#radio_fou_1000").prop("checked", true);
                    break;
                case "2000" :
                    $("#radio_fou_2000").prop("checked", true);
                    break;
                default :
                    break;
            } 
        }
        if ($("#search_servant_ce_" + tabNumber).val() != "") {
            switch ($("#search_servant_ce_" + tabNumber).val()) {
                case "0" :
                    $("#radio_ce_atk_0").prop("checked", true);
                    break;
                case "100" :
                    $("#radio_ce_atk_100").prop("checked", true);
                    break;
                case "1000" :
                    $("#radio_ce_atk_1000").prop("checked", true);
                    break;
                case "2000" :
                    $("#radio_ce_atk_2000").prop("checked", true);
                    break;
                case "2400" :
                    $("#radio_ce_atk_2400").prop("checked", true);
                    break;
                default :
                    break;
            } 
        }

        return true;

    });

    /**
     * サーヴァント検索―クラス・レアリティ変更イベント
     */
    $(document).on("change", ".servarnt-search-select", function () {

        // サーヴァントセレクトボックスを再作成
        remakeServantSelectBox();

    });

    /**
     * サーヴァント検索―選択押下イベント
     */
    $(document).on("click", "#btnSelected", function() {

        var tabNumber = $("input[name='tab-radio']:checked").val();

        if ($("#servant-name").val() != null) {
            // 入力初期化
            clearParam(tabNumber);

            $(servantList).each(function() {
                
                if ($("#servant-name").val() == this["No"]) {

                    var atk;

                    switch ($("input[name='rdo_lvl']:checked").val()) {
                        case "MAX" :
                            atk = Number(this["MaxAtk"]);
                            break;
                        case "100" :
                            atk = rounddown(Number(this["BaseAtk"]) 
                                + (Number(this["MaxAtk"]) - Number(this["BaseAtk"])) 
                                * Number(correctio_lv100[Number(this["レアリティ"])]),0);
                            break;
                        case "110" :
                            atk = rounddown(Number(this["BaseAtk"]) 
                                + (Number(this["MaxAtk"]) - Number(this["BaseAtk"])) 
                                * Number(correctio_lv110[Number(this["レアリティ"])]),0);
                            break;
                        case "120" :
                            atk = rounddown(Number(this["BaseAtk"]) 
                                + (Number(this["MaxAtk"]) - Number(this["BaseAtk"])) 
                                * Number(correctio_lv120[Number(this["レアリティ"])]),0);
                            break;
                        default :
                            break;
                    }

                    // サーヴァント名
                    $("#servant_name_" + tabNumber).val(this["サーヴァント名"]);
                    // ATK
                    $("#atk_" + tabNumber).val(Number(atk) + Number($("input[name='rdo_fou']:checked").val()) + Number($("input[name='rdo_ce']:checked").val()));
                    // 宝具倍率
                    switch ($("input[name='rdo_np_lvl']:checked").val()) {
                        case "1" :
                            if (this["宝具Lv1"] != "0") {
                                $("#np_dmg_" + tabNumber).val(this["宝具Lv1"]);
                            }
                            break;
                        case "2" :
                            if (this["宝具Lv2"] != "0") {
                                $("#np_dmg_" + tabNumber).val(this["宝具Lv2"]);
                            }
                            break;
                        case "3" :
                            if (this["宝具Lv3"] != "0") {
                                $("#np_dmg_" + tabNumber).val(this["宝具Lv3"]);
                            }
                            break;
                        case "4" :
                            if (this["宝具Lv4"] != "0") {
                                $("#np_dmg_" + tabNumber).val(this["宝具Lv4"]);
                            }
                            break;
                        case "5" :
                            if (this["宝具Lv5"] != "0") {
                                $("#np_dmg_" + tabNumber).val(this["宝具Lv5"]);
                            }
                            break;
                        default :
                            break;
                    }
                    // 宝具種類
                    $("#np_kind_" + tabNumber).val(this["宝具カード"]);
                    // クラススキル_カード
                    if (this["クラススキル_Bバフ"] != "0"){
                        $("#b_card_buff_" + tabNumber).val(this["クラススキル_Bバフ"]);
                    }
                    if (this["クラススキル_Aバフ"] != "0") {
                        $("#a_card_buff_" + tabNumber).val(this["クラススキル_Aバフ"]);
                    }
                    if (this["クラススキル_Qバフ"] != "0") {
                        $("#q_card_buff_" + tabNumber).val(this["クラススキル_Qバフ"]);
                    }
                    // クラススキル_クリティカル
                    if (this["クラススキル_クリバフ"] != "") {
                        $("#cri_buff_" + tabNumber).val(this["クラススキル_クリバフ"]);
                    }
                    if (this["クラススキル_Bクリバフ"] != "") {
                        $("#b_card_cri_buff_" + tabNumber).val(this["クラススキル_Bクリバフ"]);
                    }
                    if (this["クラススキル_Aクリバフ"] != "") {
                        $("#a_card_cri_buff_" + tabNumber).val(this["クラススキル_Aクリバフ"]);
                    }
                    if (this["クラススキル_Qクリバフ"] != "") {
                        $("#q_card_cri_buff_" + tabNumber).val(this["クラススキル_Qクリバフ"]);
                    }
                    // クラススキル_宝具
                    if (this["クラススキル_宝具バフ"] != "0") {
                        $("#np_buff_" + tabNumber).val(this["クラススキル_宝具バフ"]);
                    }
                    // クラススキル_固定ダメージ
                    if (this["クラススキル_固定ダメージ"] != "0") {
                        $("#fixed_dmg_" + tabNumber).val(this["クラススキル_固定ダメージ"]);
                    }
                    // クラス相性
                    switch (this["クラス"]) {
                        case "剣" :
                        case "騎" :
                            $("#class_affinity_" + tabNumber).val("2.0");
                            $("#class_servant_" + tabNumber).val("1.00");
                            break;
                        case "弓" :
                            $("#class_affinity_" + tabNumber).val("2.0");
                            $("#class_servant_" + tabNumber).val("0.95");
                            break;
                        case "槍" :
                            $("#class_affinity_" + tabNumber).val("2.0");
                            $("#class_servant_" + tabNumber).val("1.05");
                            break;
                        case "術" :
                        case "殺" :
                            $("#class_affinity_" + tabNumber).val("2.0");
                            $("#class_servant_" + tabNumber).val("0.90");
                            break;
                        case "狂" :
                            $("#class_affinity_" + tabNumber).val("1.5");
                            $("#class_servant_" + tabNumber).val("1.10");
                            break;
                        case "盾" :
                        case "月" :
                        case "降" :
                            $("#class_affinity_" + tabNumber).val("1.0");
                            $("#class_servant_" + tabNumber).val("1.00");
                            break;
                        case "裁" :
                        case "讐" :
                            $("#class_affinity_" + tabNumber).val("1.0");
                            $("#class_servant_" + tabNumber).val("1.10");
                            break;
                        case "分" :
                        case "詐" :
                            $("#class_affinity_" + tabNumber).val("1.5");
                            $("#class_servant_" + tabNumber).val("1.00");
                            break;
                        default :
                            break;
                    }

                    // hidden
                    $("#search_servant_class_" + tabNumber).val($("#servant-class").val());
                    $("#search_servant_rare_" + tabNumber).val($("#servant-rare").val());
                    $("#search_servant_lvl_" + tabNumber).val($("input[name='rdo_lvl']:checked").val());
                    $("#search_servant_nplvl_" + tabNumber).val($("input[name='rdo_np_lvl']:checked").val());
                    $("#search_servant_fou_" + tabNumber).val($("input[name='rdo_fou']:checked").val());
                    $("#search_servant_ce_" + tabNumber).val($("input[name='rdo_ce']:checked").val());
                    $("#servant_No_" + tabNumber).val(this["No"]);
                    $("#servant_Name_" + tabNumber).val(this["サーヴァント名"]);
                    $("#servant_class_" + tabNumber).val(this["クラス"]);
                    $("#servant_rare_" + tabNumber).val(this["レアリティ"]);
                    $("#servant_NA_" + tabNumber).val(this["N_N/A"]);
                    $("#servant_SR_" + tabNumber).val(this["SR"]);
                    $("#servant_AHIT_" + tabNumber).val(this["AHIT"]);
                    $("#servant_QHIT_" + tabNumber).val(this["QHIT"]);
                    $("#servant_BHIT_" + tabNumber).val(this["BHIT"]);
                    $("#servant_EXHIT_" + tabNumber).val(this["EXHIT"]);
                    $("#servant_NHIT_" + tabNumber).val(this["NHIT"]);

                }

            });

        }

        // 再計算
        calcMain(tabNumber)

        // モーダルを閉じる
        $("#search-modal").modal("hide");
        
        return true;

    });

    // CSVの読み込み
    $.get("https://fategoplayer.github.io/fgodamagecalculator-tab/servant_data.csv", parseCsv, "text");

});

/**
 * サーヴァントセレクトボックス再作成
 */
 function remakeServantSelectBox() {
    let className = $("#servant-class").val();
    let rarity = $("#servant-rare").val();

    if (className != "" || rarity != "") {
        // サーヴァントセレクトボックスを削除
        while ($("#servant-name")[0].lastChild) {
            $("#servant-name")[0].removeChild($("#servant-name")[0].lastChild);
        }

        // 指定されたクラスのみで再作成
        $(servantList).each(function() {
            var option = document.createElement("option");

            if (className != "" && rarity != "") {
                if (this["クラス"] == className && this["レアリティ"] == rarity) {
                    option.value = this["No"];
                    option.textContent = this["サーヴァント名"];
                    $("#servant-name")[0].appendChild(option);
                }
            }
            else if (className != "" && rarity == "") {
                if (this["クラス"] == className) {
                    option.value = this["No"];
                    option.textContent = this["サーヴァント名"];
                    $("#servant-name")[0].appendChild(option);
                }
            }
            else if (className == "" && rarity != "") {
                if (this["レアリティ"] == rarity) {
                    option.value = this["No"];
                    option.textContent = this["サーヴァント名"];
                    $("#servant-name")[0].appendChild(option);
                }
            }

        });
    }
    else {

        // サーヴァントセレクトボックスを削除
        while ($("#servant-name")[0].lastChild) {
            $("#servant-name")[0].removeChild($("#servant-name")[0].lastChild);
        }

        // 全てのサーヴァントで再作成
        $(servantList).each(function() {
            var option = document.createElement("option");  
            option.value = this["No"];
            option.textContent = this["サーヴァント名"];
            $("#servant-name")[0].appendChild(option);
        });

    }
}

/**
 * CSV読込
 * @param data csvパス
 */
function parseCsv(data) {
    // CSVを配列で読み込む
    var csv = $.csv.toArrays(data);

    servantList = new Array();

    $(csv).each(function() {
        
        var option = document.createElement("option");  
        var servant = {};

        servant["No"] = this[0];
        servant["サーヴァント名"] = this[1];
        servant["クラス"] = this[2];
        servant["レアリティ"] = this[3];
        servant["BaseHP"] = this[4];
        servant["MaxHP"] = this[5];
        servant["BaseAtk"] = this[6];
        servant["MaxAtk"] = this[7];
        servant["天地人"] = this[8];
        servant["A_N/A"] = this[9];
        servant["B_N/A"] = this[10];
        servant["Q_N/A"] = this[11];
        servant["EX_N/A"] = this[12];
        servant["N_N/A"] = this[13];
        servant["N/D"] = this[14];
        servant["SR"] = this[15];
        servant["SW"] = this[16];
        servant["DR"] = this[17];
        servant["AHIT"] = this[18];
        servant["BHIT"] = this[19];
        servant["QHIT"] = this[20];
        servant["EXHIT"] = this[21];
        servant["宝具HIT"] = this[22];
        servant["カード"] = this[23];
        servant["宝具カード"] = this[24];
        servant["宝具Lv1"] = this[25];
        servant["宝具Lv2"] = this[26];
        servant["宝具Lv3"] = this[27];
        servant["宝具Lv4"] = this[28];
        servant["宝具Lv5"] = this[29];
        servant["クラススキル_固定ダメージ"] = this[30];
        servant["クラススキル_Aバフ"] = this[31];
        servant["クラススキル_Bバフ"] = this[32];
        servant["クラススキル_Qバフ"] = this[33];
        servant["クラススキル_宝具バフ"] = this[34];
        servant["クラススキル_クリバフ"] = this[35];
        servant["クラススキル_Aクリバフ"] = this[36];
        servant["クラススキル_Bクリバフ"] = this[37];
        servant["クラススキル_Qクリバフ"] = this[38];
        servant["クラススキル_NP獲得バフ"] = this[39];
        servant["クラススキル_NP獲得Aバフ"] = this[40];
        servant["クラススキル_NP獲得Bバフ"] = this[41];
        servant["クラススキル_NP獲得Qバフ"] = this[42];
        servant["クラススキル_スター獲得バフ"] = this[43];
        servant["クラススキル_スター獲得Aバフ"] = this[44];
        servant["クラススキル_スター獲得Bバフ"] = this[45];
        servant["クラススキル_スター獲得Qバフ"] = this[46];
        servant["性別"] = this[47];
        servant["属性"] = this[48];
        servant["性格"] = this[49];
        servant["特性"] = this[50];

        servantList.push(servant);

        option.value = servant["No"];
        option.textContent = servant["サーヴァント名"];
        $("#servant-name")[0].appendChild(option);

    });
    
}

/**
 * コピー
 * @param copy_from コピー元
 * @param copy_to コピー先
 */
 function copyParam(copy_from, copy_to) {
    $("#servant_name_" + copy_to).val($("#servant_name_" + copy_from).val());
    $("#atk_" + copy_to).val($("#atk_" + copy_from).val());
    $("#np_dmg_" + copy_to).val($("#np_dmg_" + copy_from).val());
    $("#np_kind_" + copy_to).val($("#np_kind_" + copy_from).val());
    $("#atk_buff_" + copy_to).val($("#atk_buff_" + copy_from).val());
    $("#def_debuff_" + copy_to).val($("#def_debuff_" + copy_from).val());
    $("#b_card_buff_" + copy_to).val($("#b_card_buff_" + copy_from).val());
    $("#b_card_cri_buff_" + copy_to).val($("#b_card_cri_buff_" + copy_from).val());
    $("#a_card_buff_" + copy_to).val($("#a_card_buff_" + copy_from).val());
    $("#a_card_cri_buff_" + copy_to).val($("#a_card_cri_buff_" + copy_from).val());
    $("#q_card_buff_" + copy_to).val($("#q_card_buff_" + copy_from).val());
    $("#q_card_cri_buff_" + copy_to).val($("#q_card_cri_buff_" + copy_from).val());
    $("#b_card_debuff_" + copy_to).val($("#b_card_debuff_" + copy_from).val());
    $("#a_card_debuff_" + copy_to).val($("#a_card_debuff_" + copy_from).val());
    $("#q_card_debuff_" + copy_to).val($("#q_card_debuff_" + copy_from).val());
    $("#cri_buff_" + copy_to).val($("#cri_buff_" + copy_from).val());
    $("#np_buff_" + copy_to).val($("#np_buff_" + copy_from).val());
    $("#ex_atk_buff_" + copy_to).val($("#ex_atk_buff_" + copy_from).val());
    $("#supereffective_buff_" + copy_to).val($("#supereffective_buff_" + copy_from).val());
    $("#supereffective_np_" + copy_to).val($("#supereffective_np_" + copy_from).val());
    $("#fixed_dmg_" + copy_to).val($("#fixed_dmg_" + copy_from).val());
    $("#b_footprints_" + copy_to).val($("#b_footprints_" + copy_from).val());
    $("#a_footprints_" + copy_to).val($("#a_footprints_" + copy_from).val());
    $("#q_footprints_" + copy_to).val($("#q_footprints_" + copy_from).val());
    $("#special_def_" + copy_to).val($("#special_def_" + copy_from).val());
    $("#advanced_atk_buff_1st_" + copy_to).val($("#advanced_atk_buff_1st_" + copy_from).val());
    $("#advanced_atk_buff_2nd_" + copy_to).val($("#advanced_atk_buff_2nd_" + copy_from).val());
    $("#advanced_atk_buff_3rd_" + copy_to).val($("#advanced_atk_buff_3rd_" + copy_from).val());
    $("#advanced_atk_buff_Ex_" + copy_to).val($("#advanced_atk_buff_Ex_" + copy_from).val());
    $("#advanced_card_buff_1st_" + copy_to).val($("#advanced_card_buff_1st_" + copy_from).val());
    $("#advanced_card_buff_2nd_" + copy_to).val($("#advanced_card_buff_2nd_" + copy_from).val());
    $("#advanced_card_buff_3rd_" + copy_to).val($("#advanced_card_buff_3rd_" + copy_from).val());
    $("#advanced_cri_buff_1st_" + copy_to).val($("#advanced_cri_buff_1st_" + copy_from).val());
    $("#advanced_cri_buff_2nd_" + copy_to).val($("#advanced_cri_buff_2nd_" + copy_from).val());
    $("#advanced_cri_buff_3rd_" + copy_to).val($("#advanced_cri_buff_3rd_" + copy_from).val());
    $("#advanced_supereffective_buff_1st_" + copy_to).val($("#advanced_supereffective_buff_1st_" + copy_from).val());
    $("#advanced_supereffective_buff_2nd_" + copy_to).val($("#advanced_supereffective_buff_2nd_" + copy_from).val());
    $("#advanced_supereffective_buff_3rd_" + copy_to).val($("#advanced_supereffective_buff_3rd_" + copy_from).val());
    $("#advanced_supereffective_buff_Ex_" + copy_to).val($("#advanced_supereffective_buff_Ex_" + copy_from).val());
    $("#advanced_fixed_dmg_1st_" + copy_to).val($("#advanced_fixed_dmg_1st_" + copy_from).val());
    $("#advanced_fixed_dmg_2nd_" + copy_to).val($("#advanced_fixed_dmg_2nd_" + copy_from).val());
    $("#advanced_fixed_dmg_3rd_" + copy_to).val($("#advanced_fixed_dmg_3rd_" + copy_from).val());
    $("#advanced_fixed_dmg_Ex_" + copy_to).val($("#advanced_fixed_dmg_Ex_" + copy_from).val());
    $("#advanced_special_def_1st_" + copy_to).val($("#advanced_special_def_1st_" + copy_from).val());
    $("#advanced_special_def_2nd_" + copy_to).val($("#advanced_special_def_2nd_" + copy_from).val());
    $("#advanced_special_def_3rd_" + copy_to).val($("#advanced_special_def_3rd_" + copy_from).val());
    $("#advanced_special_def_Ex_" + copy_to).val($("#advanced_special_def_Ex_" + copy_from).val());
    $("#class_affinity_" + copy_to).val($("#class_affinity_" + copy_from).val());
    $("#attribute_affinity_" + copy_to).val($("#attribute_affinity_" + copy_from).val());
    $("#class_servant_" + copy_to).val($("#class_servant_" + copy_from).val());
    $("#card_1st_" + copy_to).val($("#card_1st_" + copy_from).val());
    $("#card_1st_cri_" + copy_to).val($("#card_1st_cri_" + copy_from).val());
    $("#card_2nd_" + copy_to).val($("#card_2nd_" + copy_from).val());
    $("#card_2nd_cri_" + copy_to).val($("#card_2nd_cri_" + copy_from).val());
    $("#card_3rd_" + copy_to).val($("#card_3rd_" + copy_from).val());
    $("#card_3rd_cri_" + copy_to).val($("#card_3rd_cri_" + copy_from).val());
    $("#ex_cri_" + copy_to).val($("#ex_cri_" + copy_from).val());
    // hidden
    $("#search_servant_class_" + copy_to).val($("#search_servant_class_" + copy_from).val());
    $("#search_servant_rare_" + copy_to).val($("#search_servant_rare_" + copy_from).val());
    $("#search_servant_lvl_" + copy_to).val($("#search_servant_lvl_" + copy_from).val());
    $("#search_servant_nplvl_" + copy_to).val($("#search_servant_nplvl_" + copy_from).val());
    $("#search_servant_fou_" + copy_to).val($("#search_servant_fou_" + copy_from).val());
    $("#search_servant_ce_" + copy_to).val($("#search_servant_ce_" + copy_from).val());
    $("#servant_No_" + copy_to).val($("#servant_No_" + copy_from).val());
    $("#servant_Name_" + copy_to).val($("#servant_Name_" + copy_from).val());
    $("#servant_class_" + copy_to).val($("#servant_class_" + copy_from).val());
    $("#servant_rare_" + copy_to).val($("#servant_rare_" + copy_from).val());
    $("#servant_NA_" + copy_to).val($("#servant_NA_" + copy_from).val());
    $("#servant_SR_" + copy_to).val($("#servant_SR_" + copy_from).val());
    $("#servant_AHIT_" + copy_to).val($("#servant_AHIT_" + copy_from).val());
    $("#servant_QHIT_" + copy_to).val($("#servant_QHIT_" + copy_from).val());
    $("#servant_BHIT_" + copy_to).val($("#servant_BHIT_" + copy_from).val());
    $("#servant_EXHIT_" + copy_to).val($("#servant_EXHIT_" + copy_from).val());
    $("#servant_NHIT_" + copy_to).val($("#servant_NHIT_" + copy_from).val());
}

/**
 * パラメーター初期化
 * @param tabNumber タブ番号
 */
 function clearParam(tabNumber) {
    $("#servant_name_" + tabNumber).val("");
    $("#atk_" + tabNumber).val("");
    $("#np_dmg_" + tabNumber).val("");
    $("#np_kind_" + tabNumber).val("B");
    $("#atk_buff_" + tabNumber).val("");
    $("#def_debuff_" + tabNumber).val("");
    $("#b_card_buff_" + tabNumber).val("");
    $("#b_card_cri_buff_" + tabNumber).val("");
    $("#a_card_buff_" + tabNumber).val("");
    $("#a_card_cri_buff_" + tabNumber).val("");
    $("#q_card_buff_" + tabNumber).val("");
    $("#q_card_cri_buff_" + tabNumber).val("");
    $("#b_card_debuff_" + tabNumber).val("");
    $("#a_card_debuff_" + tabNumber).val("");
    $("#q_card_debuff_" + tabNumber).val("");
    $("#cri_buff_" + tabNumber).val("");
    $("#np_buff_" + tabNumber).val("");
    $("#ex_atk_buff_" + tabNumber).val("");
    $("#supereffective_buff_" + tabNumber).val("");
    $("#supereffective_np_" + tabNumber).val("100");
    $("#fixed_dmg_" + tabNumber).val("");
    $("#b_footprints_" + tabNumber).val("");
    $("#a_footprints_" + tabNumber).val("");
    $("#q_footprints_" + tabNumber).val("");
    $("#special_def_" + tabNumber).val("");
    $("#advanced_atk_buff_1st_" + tabNumber).val("");
    $("#advanced_atk_buff_2nd_" + tabNumber).val("");
    $("#advanced_atk_buff_3rd_" + tabNumber).val("");
    $("#advanced_atk_buff_Ex_" + tabNumber).val("");
    $("#advanced_card_buff_1st_" + tabNumber).val("");
    $("#advanced_card_buff_2nd_" + tabNumber).val("");
    $("#advanced_card_buff_3rd_" + tabNumber).val("");
    $("#advanced_cri_buff_1st_" + tabNumber).val("");
    $("#advanced_cri_buff_2nd_" + tabNumber).val("");
    $("#advanced_cri_buff_3rd_" + tabNumber).val("");
    $("#advanced_supereffective_buff_1st_" + tabNumber).val("");
    $("#advanced_supereffective_buff_2nd_" + tabNumber).val("");
    $("#advanced_supereffective_buff_3rd_" + tabNumber).val("");
    $("#advanced_supereffective_buff_Ex_" + tabNumber).val("");
    $("#advanced_fixed_dmg_1st_" + tabNumber).val("");
    $("#advanced_fixed_dmg_2nd_" + tabNumber).val("");
    $("#advanced_fixed_dmg_3rd_" + tabNumber).val("");
    $("#advanced_fixed_dmg_Ex_" + tabNumber).val("");
    $("#advanced_special_def_1st_" + tabNumber).val("");
    $("#advanced_special_def_2nd_" + tabNumber).val("");
    $("#advanced_special_def_3rd_" + tabNumber).val("");
    $("#advanced_special_def_Ex_" + tabNumber).val("");
    $("#class_affinity_" + tabNumber).val("2.0");
    $("#attribute_affinity_" + tabNumber).val("1.0");
    $("#class_servant_" + tabNumber).val("1.00");
    $("#card_1st_" + tabNumber).val("NP");
    $("#card_1st_cri_" + tabNumber).val("Y");
    $("#card_2nd_" + tabNumber).val("B");
    $("#card_2nd_cri_" + tabNumber).val("Y");
    $("#card_3rd_" + tabNumber).val("B");
    $("#card_3rd_cri_" + tabNumber).val("Y");
    $("#ex_cri_" + tabNumber).val("N");
    $("#dmg_min_1st_" + tabNumber).val("0");
    $("#dmg_ave_1st_" + tabNumber).val("0");
    $("#dmg_max_1st_" + tabNumber).val("0");
    $("#dmg_min_2nd_" + tabNumber).val("0");
    $("#dmg_ave_2nd_" + tabNumber).val("0");
    $("#dmg_max_2nd_" + tabNumber).val("0");
    $("#dmg_min_3rd_" + tabNumber).val("0");
    $("#dmg_ave_3rd_" + tabNumber).val("0");
    $("#dmg_max_3rd_" + tabNumber).val("0");
    $("#dmg_min_ex_" + tabNumber).val("0");
    $("#dmg_ave_ex_" + tabNumber).val("0");
    $("#dmg_max_ex_" + tabNumber).val("0");
    $("#dmg_min_total_" + tabNumber).val("0");
    $("#dmg_ave_total_" + tabNumber).val("0");
    $("#dmg_max_total_" + tabNumber).val("0");
    // hidden
    $("#search_servant_class_" + tabNumber).val("");
    $("#search_servant_rare_" + tabNumber).val("");
    $("#search_servant_lvl_" + tabNumber).val("");
    $("#search_servant_nplvl_" + tabNumber).val("");
    $("#search_servant_fou_" + tabNumber).val("");
    $("#search_servant_ce_" + tabNumber).val("");
    $("#servant_No_" + tabNumber).val("");
    $("#servant_Name_" + tabNumber).val("");
    $("#servant_class_" + tabNumber).val("");
    $("#servant_rare_" + tabNumber).val("");
    $("#servant_NA_" + tabNumber).val("");
    $("#servant_SR_" + tabNumber).val("");
    $("#servant_AHIT_" + tabNumber).val("");
    $("#servant_QHIT_" + tabNumber).val("");
    $("#servant_BHIT_" + tabNumber).val("");
    $("#servant_EXHIT_" + tabNumber).val("");
    $("#servant_NHIT_" + tabNumber).val("");
}

/**
 * 計算メイン処理
 * @param tabNumber 計算対象行
 */
 function calcMain(tabNumber) {
    var atk, np_dmg, np_kind, atk_buff, def_debuff, b_card_buff, b_card_cri_buff, a_card_buff, a_card_cri_buff, q_card_buff, q_card_cri_buff,
    b_card_debuff, a_card_debuff, q_card_debuff, cri_buff, np_buff, ex_atk_buff, supereffective_buff, supereffective_np, fixed_dmg, b_footprints, a_footprints, q_footprints,
    special_def, advanced_atk_buff_1st, advanced_atk_buff_2nd, advanced_atk_buff_3rd, advanced_atk_buff_ex,
    advanced_supereffective_buff_1st, advanced_supereffective_buff_2nd, advanced_supereffective_buff_3rd, advanced_supereffective_buff_ex,
    advanced_fixed_dmg_1st, advanced_fixed_dmg_2nd, advanced_fixed_dmg_3rd, advanced_fixed_dmg_ex, 
    advanced_special_def_1st, advanced_special_def_2nd, advanced_special_def_3rd, advanced_special_def_ex,
    advanced_card_buff_1st, advanced_card_buff_2nd, advanced_card_buff_3rd,
    advanced_cri_buff_1st, advanced_cri_buff_2nd, advanced_cri_buff_3rd,
    class_affinity, attribute_affinity, class_servant, card_1st, card_1st_cri, card_2nd, card_2nd_cri, card_3rd, card_3rd_cri, ex_cri,
    bbonus_1st, bbonus_2nd, bbonus_3rd, exbonus, bbonus_all, bchain_bonus, atk_1st, atk_2nd, atk_3rd, card_buff_1st, card_buff_2nd, card_buff_3rd,
    supereffective_buff_1st, supereffective_buff_2nd, supereffective_buff_3rd, supereffective_buff_ex,
    fixed_dmg_1st, fixed_dmg_2nd, fixed_dmg_3rd, fixed_dmg_ex, special_def_1st, special_def_2nd, special_def_3rd, special_def_ex,
    atk_buff_1st, atk_buff_2nd, atk_buff_3rd, atk_buff_ex,
    cri_buff_1st, cri_buff_2nd, cri_buff_3rd, np_card_buff,
    dmg_ave_1st, dmg_ave_2nd, dmg_ave_3rd, dmg_ave_EX,
    dmg_max_1st, dmg_max_2nd, dmg_max_3rd, dmg_max_EX,
    dmg_min_1st, dmg_min_2nd, dmg_min_3rd, dmg_min_EX,
    dmg_cri_ave_1st, dmg_cri_ave_2nd, dmg_cri_ave_3rd,
    dmg_cri_max_1st, dmg_cri_max_2nd, dmg_cri_max_3rd,
    dmg_cri_min_1st, dmg_cri_min_2nd, dmg_cri_min_3rd;

    // 初期化
    atk = 0;
    np_dmg = 0;
    atk_buff = 0;
    def_debuff = 0;
    b_card_buff = 0;
    b_card_cri_buff = 0;
    a_card_buff = 0;
    a_card_cri_buff = 0;
    q_card_buff = 0;
    q_card_cri_buff = 0;
    b_card_debuff = 0;
    a_card_debuff = 0;
    q_card_debuff = 0;
    cri_buff = 0;
    np_buff = 0;
    ex_atk_buff = 0;
    supereffective_buff = 0;
    supereffective_np = 0;
    fixed_dmg = 0;
    b_footprints = 0;
    a_footprints = 0;
    q_footprints = 0;
    special_def = 0;
    advanced_atk_buff_1st = 0;
    advanced_atk_buff_2nd = 0;
    advanced_atk_buff_3rd = 0;
    advanced_atk_buff_ex = 0;
    advanced_card_buff_1st = 0;
    advanced_card_buff_2nd = 0;
    advanced_card_buff_3rd = 0;
    advanced_cri_buff_1st = 0;
    advanced_cri_buff_2nd = 0;
    advanced_cri_buff_3rd = 0;
    advanced_supereffective_buff_1st = 0;
    advanced_supereffective_buff_2nd = 0;
    advanced_supereffective_buff_3rd = 0;
    advanced_supereffective_buff_ex = 0;
    advanced_fixed_dmg_1st = 0;
    advanced_fixed_dmg_2nd = 0;
    advanced_fixed_dmg_3rd = 0;
    advanced_fixed_dmg_ex = 0;
    advanced_special_def_1st = 0;
    advanced_special_def_2nd = 0;
    advanced_special_def_3rd = 0;
    advanced_special_def_ex = 0;
    bbonus_all = 0;
    bchain_bonus = 0;
    exbonus = 200;

    // 計算パラメーター取得
    if ($("#atk_" + tabNumber).val() != "") { atk = parseFloat($("#atk_" + tabNumber).val()); }
    if ($("#np_dmg_" + tabNumber).val() != "") { np_dmg = parseFloat($("#np_dmg_" + tabNumber).val()); }
    np_kind = $("#np_kind_" + tabNumber).val();
    if ($("#atk_buff_" + tabNumber).val() != "") { atk_buff = parseFloat($("#atk_buff_" + tabNumber).val()); }
    if ($("#def_debuff_" + tabNumber).val() != "") { def_debuff = parseFloat($("#def_debuff_" + tabNumber).val()); }
    if ($("#b_card_buff_" + tabNumber).val() != "") { b_card_buff = parseFloat($("#b_card_buff_" + tabNumber).val()); }
    if ($("#b_card_cri_buff_" + tabNumber).val() != "") { b_card_cri_buff = parseFloat($("#b_card_cri_buff_" + tabNumber).val()); }
    if ($("#a_card_buff_" + tabNumber).val() != "") { a_card_buff = parseFloat($("#a_card_buff_" + tabNumber).val()); }
    if ($("#a_card_cri_buff_" + tabNumber).val() != "") { a_card_cri_buff = parseFloat($("#a_card_cri_buff_" + tabNumber).val()); }
    if ($("#q_card_buff_" + tabNumber).val() != "") { q_card_buff = parseFloat($("#q_card_buff_" + tabNumber).val()); }
    if ($("#q_card_cri_buff_" + tabNumber).val() != "") { q_card_cri_buff = parseFloat($("#q_card_cri_buff_" + tabNumber).val()); }
    if ($("#b_card_debuff_" + tabNumber).val() != "") { b_card_debuff = parseFloat($("#b_card_debuff_" + tabNumber).val()); }
    if ($("#a_card_debuff_" + tabNumber).val() != "") { a_card_debuff = parseFloat($("#a_card_debuff_" + tabNumber).val()); }
    if ($("#q_card_debuff_" + tabNumber).val() != "") { q_card_debuff = parseFloat($("#q_card_debuff_" + tabNumber).val()); }
    if ($("#cri_buff_" + tabNumber).val() != "") { cri_buff = parseFloat($("#cri_buff_" + tabNumber).val()); }
    if ($("#np_buff_" + tabNumber).val() != "") { np_buff = parseFloat($("#np_buff_" + tabNumber).val()); }
    if ($("#ex_atk_buff_" + tabNumber).val() != "") { ex_atk_buff = parseFloat($("#ex_atk_buff_" + tabNumber).val()); }
    if ($("#supereffective_buff_" + tabNumber).val() != "") { supereffective_buff = parseFloat($("#supereffective_buff_" + tabNumber).val()); }
    if ($("#supereffective_np_" + tabNumber).val() != "") { supereffective_np = parseFloat($("#supereffective_np_" + tabNumber).val()); }
    if ($("#fixed_dmg_" + tabNumber).val() != "") { fixed_dmg = parseFloat($("#fixed_dmg_" + tabNumber).val()); }
    if ($("#b_footprints_" + tabNumber).val() != "") { b_footprints = parseFloat($("#b_footprints_" + tabNumber).val()); }
    if ($("#a_footprints_" + tabNumber).val() != "") { a_footprints = parseFloat($("#a_footprints_" + tabNumber).val()); }
    if ($("#q_footprints_" + tabNumber).val() != "") { q_footprints = parseFloat($("#q_footprints_" + tabNumber).val()); }
    if ($("#special_def_" + tabNumber).val() != "") { special_def = parseFloat($("#special_def_" + tabNumber).val()); }
    if ($("#advanced_atk_buff_1st_" + tabNumber).val() != "") { advanced_atk_buff_1st = parseFloat($("#advanced_atk_buff_1st_" + tabNumber).val()); }
    if ($("#advanced_atk_buff_2nd_" + tabNumber).val() != "") { advanced_atk_buff_2nd = parseFloat($("#advanced_atk_buff_2nd_" + tabNumber).val()); }
    if ($("#advanced_atk_buff_3rd_" + tabNumber).val() != "") { advanced_atk_buff_3rd = parseFloat($("#advanced_atk_buff_3rd_" + tabNumber).val()); }
    if ($("#advanced_atk_buff_Ex_" + tabNumber).val() != "") { advanced_atk_buff_ex = parseFloat($("#advanced_atk_buff_Ex_" + tabNumber).val()); }
    if ($("#advanced_card_buff_1st_" + tabNumber).val() != "") { advanced_card_buff_1st = parseFloat($("#advanced_card_buff_1st_" + tabNumber).val()); }
    if ($("#advanced_card_buff_2nd_" + tabNumber).val() != "") { advanced_card_buff_2nd = parseFloat($("#advanced_card_buff_2nd_" + tabNumber).val()); }
    if ($("#advanced_card_buff_3rd_" + tabNumber).val() != "") { advanced_card_buff_3rd = parseFloat($("#advanced_card_buff_3rd_" + tabNumber).val()); }
    if ($("#advanced_cri_buff_1st_" + tabNumber).val() != "") { advanced_cri_buff_1st = parseFloat($("#advanced_cri_buff_1st_" + tabNumber).val()); }
    if ($("#advanced_cri_buff_2nd_" + tabNumber).val() != "") { advanced_cri_buff_2nd = parseFloat($("#advanced_cri_buff_2nd_" + tabNumber).val()); }
    if ($("#advanced_cri_buff_3rd_" + tabNumber).val() != "") { advanced_cri_buff_3rd = parseFloat($("#advanced_cri_buff_3rd_" + tabNumber).val()); }
    if ($("#advanced_supereffective_buff_1st_" + tabNumber).val() != "") { advanced_supereffective_buff_1st = parseFloat($("#advanced_supereffective_buff_1st_" + tabNumber).val()); }
    if ($("#advanced_supereffective_buff_2nd_" + tabNumber).val() != "") { advanced_supereffective_buff_2nd = parseFloat($("#advanced_supereffective_buff_2nd_" + tabNumber).val()); }
    if ($("#advanced_supereffective_buff_3rd_" + tabNumber).val() != "") { advanced_supereffective_buff_3rd = parseFloat($("#advanced_supereffective_buff_3rd_" + tabNumber).val()); }
    if ($("#advanced_supereffective_buff_Ex_" + tabNumber).val() != "") { advanced_supereffective_buff_ex = parseFloat($("#advanced_supereffective_buff_Ex_" + tabNumber).val()); }
    if ($("#advanced_fixed_dmg_1st_" + tabNumber).val() != "") { advanced_fixed_dmg_1st = parseFloat($("#advanced_fixed_dmg_1st_" + tabNumber).val()); }
    if ($("#advanced_fixed_dmg_2nd_" + tabNumber).val() != "") { advanced_fixed_dmg_2nd = parseFloat($("#advanced_fixed_dmg_2nd_" + tabNumber).val()); }
    if ($("#advanced_fixed_dmg_3rd_" + tabNumber).val() != "") { advanced_fixed_dmg_3rd = parseFloat($("#advanced_fixed_dmg_3rd_" + tabNumber).val()); }
    if ($("#advanced_fixed_dmg_Ex_" + tabNumber).val() != "") { advanced_fixed_dmg_ex = parseFloat($("#advanced_fixed_dmg_Ex_" + tabNumber).val()); }
    if ($("#advanced_special_def_1st_" + tabNumber).val() != "") { advanced_special_def_1st = parseFloat($("#advanced_special_def_1st_" + tabNumber).val()); }
    if ($("#advanced_special_def_2nd_" + tabNumber).val() != "") { advanced_special_def_2nd = parseFloat($("#advanced_special_def_2nd_" + tabNumber).val()); }
    if ($("#advanced_special_def_3rd_" + tabNumber).val() != "") { advanced_special_def_3rd = parseFloat($("#advanced_special_def_3rd_" + tabNumber).val()); }
    if ($("#advanced_special_def_Ex_" + tabNumber).val() != "") { advanced_special_def_ex = parseFloat($("#advanced_special_def_Ex_" + tabNumber).val()); }
    class_affinity = parseFloat($("#class_affinity_" + tabNumber).val());
    attribute_affinity = parseFloat($("#attribute_affinity_" + tabNumber).val());
    class_servant = parseFloat($("#class_servant_" + tabNumber).val());
    card_1st = $("#card_1st_" + tabNumber).val();
    card_1st_cri = $("#card_1st_cri_" + tabNumber).val();
    card_2nd = $("#card_2nd_" + tabNumber).val();
    card_2nd_cri = $("#card_2nd_cri_" + tabNumber).val();
    card_3rd = $("#card_3rd_" + tabNumber).val();
    card_3rd_cri = $("#card_3rd_cri_" + tabNumber).val();
    ex_cri = $("#ex_cri_" + tabNumber).val();

    if (b_card_buff > 400) { b_card_buff = 400 };
    if (a_card_buff > 400) { a_card_buff = 400 };
    if (q_card_buff > 400) { q_card_buff = 400 };
    if (ex_atk_buff > 400) { ex_atk_buff = 400 };
    if (atk_buff > 400) { atk_buff = 400 };
    if (atk_buff < -100) { atk_buff = -100 };
    if (def_debuff > 100) { def_debuff = 100 };
    if (supereffective_buff > 1000) { supereffective_buff = 1000 };
    if (cri_buff > 500) { cri_buff = 500 };

    // カード選択ボーナスを設定
    // 1st
    if (card_1st == "Q") {
        bbonus_1st = 80;
        card_buff_1st = q_card_buff + q_card_debuff + advanced_card_buff_1st;
        cri_buff_1st = cri_buff + q_card_cri_buff + advanced_cri_buff_1st;
        atk_1st = atk + q_footprints;
    }
    if (card_1st == "A") {
        bbonus_1st = 100;
        card_buff_1st = a_card_buff + a_card_debuff + advanced_card_buff_1st;
        cri_buff_1st = cri_buff + a_card_cri_buff + advanced_cri_buff_1st;
        atk_1st = atk + a_footprints;
    }
    if (card_1st == "B") {
        bbonus_all = 50;
        bbonus_1st = 150;
        card_buff_1st = b_card_buff + b_card_debuff + advanced_card_buff_1st;
        cri_buff_1st = cri_buff + b_card_cri_buff + advanced_cri_buff_1st;
        atk_1st = atk + b_footprints;
    }
    if (card_1st == "NP" && np_kind == "Q") {
        np_card_buff = q_card_buff + q_card_debuff + advanced_card_buff_1st;
        bbonus_1st = 80;
        card_buff_1st = q_card_buff + q_card_debuff + advanced_card_buff_1st;
        cri_buff_1st = cri_buff + q_card_cri_buff + advanced_cri_buff_1st;
    }
    if (card_1st == "NP" && np_kind == "A") {
        np_card_buff = a_card_buff + a_card_debuff + advanced_card_buff_1st;
        bbonus_1st = 100;
        card_buff_1st = a_card_buff + a_card_debuff + advanced_card_buff_1st;
        cri_buff_1st = cri_buff + a_card_cri_buff + advanced_cri_buff_1st;
    }
    if (card_1st == "NP" && np_kind == "B") {
        np_card_buff = b_card_buff + b_card_debuff + advanced_card_buff_1st;
        bbonus_all = 50;
        bbonus_1st = 150;
        card_buff_1st = b_card_buff + b_card_debuff + advanced_card_buff_1st;
        cri_buff_1st = cri_buff + b_card_cri_buff + advanced_cri_buff_1st;
    }
    // 2nd
    if (card_2nd == "Q") {
        bbonus_2nd = 96;
        card_buff_2nd = q_card_buff + q_card_debuff + advanced_card_buff_2nd;
        cri_buff_2nd = cri_buff + q_card_cri_buff + advanced_cri_buff_2nd;
        atk_2nd = atk + q_footprints;
    }
    if (card_2nd == "A") {
        bbonus_2nd = 120;
        card_buff_2nd = a_card_buff + a_card_debuff + advanced_card_buff_2nd;
        cri_buff_2nd = cri_buff + a_card_cri_buff + advanced_cri_buff_2nd;
        atk_2nd = atk + a_footprints;
    }
    if (card_2nd == "B") {
        bbonus_2nd = 180;
        card_buff_2nd = b_card_buff + b_card_debuff + advanced_card_buff_2nd;
        cri_buff_2nd = cri_buff + b_card_cri_buff + advanced_cri_buff_2nd;
        atk_2nd = atk + b_footprints;
    }
    if (card_2nd == "NP" && np_kind == "Q") {
        np_card_buff = q_card_buff + q_card_debuff + advanced_card_buff_2nd;
        bbonus_2nd = 96;
        card_buff_2nd = q_card_buff + q_card_debuff + advanced_card_buff_2nd;
        cri_buff_2nd = cri_buff + q_card_cri_buff + advanced_cri_buff_2nd;
    }
    if (card_2nd == "NP" && np_kind == "A") {
        np_card_buff = a_card_buff + a_card_debuff + advanced_card_buff_2nd;
        bbonus_2nd = 120;
        card_buff_2nd = a_card_buff + a_card_debuff + advanced_card_buff_2nd;
        cri_buff_2nd = cri_buff + a_card_cri_buff + advanced_cri_buff_2nd;
    }
    if (card_2nd == "NP" && np_kind == "B") {
        np_card_buff = b_card_buff + b_card_debuff + advanced_card_buff_2nd;
        bbonus_2nd = 180;
        card_buff_2nd = b_card_buff + b_card_debuff + advanced_card_buff_2nd;
        cri_buff_2nd = cri_buff + b_card_cri_buff + advanced_cri_buff_2nd;
    }
    // 3rd
    if (card_3rd == "Q") {
        bbonus_3rd = 112;
        card_buff_3rd = q_card_buff + q_card_debuff + advanced_card_buff_3rd;
        cri_buff_3rd = cri_buff + q_card_cri_buff + advanced_cri_buff_3rd;
        atk_3rd = atk + q_footprints;
    }
    if (card_3rd == "A") {
        bbonus_3rd = 140;
        card_buff_3rd = a_card_buff + a_card_debuff + advanced_card_buff_3rd;
        cri_buff_3rd = cri_buff + a_card_cri_buff + advanced_cri_buff_3rd;
        atk_3rd = atk + a_footprints;
    }
    if (card_3rd == "B") {
        bbonus_3rd = 210;
        card_buff_3rd = b_card_buff + b_card_debuff + advanced_card_buff_3rd;
        cri_buff_3rd = cri_buff + b_card_cri_buff + advanced_cri_buff_3rd;
        atk_3rd = atk + b_footprints;
    }
    if (card_3rd == "NP" && np_kind == "Q") {
        np_card_buff = q_card_buff + q_card_debuff + advanced_card_buff_3rd;
        bbonus_3rd = 112;
        card_buff_3rd = q_card_buff + q_card_debuff + advanced_card_buff_3rd;
        cri_buff_3rd = cri_buff + q_card_cri_buff + advanced_cri_buff_3rd;
    }
    if (card_3rd == "NP" && np_kind == "A") {
        np_card_buff = a_card_buff + a_card_debuff + advanced_card_buff_3rd;
        bbonus_3rd = 140;
        card_buff_3rd = a_card_buff + a_card_debuff + advanced_card_buff_3rd;
        cri_buff_3rd = cri_buff + a_card_cri_buff + advanced_cri_buff_3rd;
    }
    if (card_3rd == "NP" && np_kind == "B") {
        np_card_buff = b_card_buff + b_card_debuff + advanced_card_buff_3rd;
        bbonus_3rd = 210;
        card_buff_3rd = b_card_buff + b_card_debuff + advanced_card_buff_3rd;
        cri_buff_3rd = cri_buff + b_card_cri_buff + advanced_cri_buff_3rd;
    }
    // 1st共通
    atk_buff_1st = atk_buff + def_debuff + advanced_atk_buff_1st;
    supereffective_buff_1st = supereffective_buff + advanced_supereffective_buff_1st;
    fixed_dmg_1st = fixed_dmg + advanced_fixed_dmg_1st;
    special_def_1st = special_def + advanced_special_def_1st;
    // 2nd共通
    atk_buff_2nd = atk_buff + def_debuff + advanced_atk_buff_2nd;
    supereffective_buff_2nd = supereffective_buff + advanced_supereffective_buff_2nd;
    fixed_dmg_2nd = fixed_dmg + advanced_fixed_dmg_2nd;
    special_def_2nd = special_def + advanced_special_def_2nd;
    // 3rd共通
    atk_buff_3rd = atk_buff + def_debuff + advanced_atk_buff_3rd;
    supereffective_buff_3rd = supereffective_buff + advanced_supereffective_buff_3rd;
    fixed_dmg_3rd = fixed_dmg + advanced_fixed_dmg_3rd;
    special_def_3rd = special_def + advanced_special_def_3rd;
    // EX共通
    atk_buff_ex = atk_buff + def_debuff + advanced_atk_buff_ex;
    supereffective_buff_ex = supereffective_buff + advanced_supereffective_buff_ex;
    fixed_dmg_ex = fixed_dmg + advanced_fixed_dmg_ex;
    special_def_ex = special_def + advanced_special_def_ex;

    // 再度上限チェック
    if (cri_buff_1st > 500) { cri_buff_1st = 500 };
    if (cri_buff_2nd > 500) { cri_buff_2nd = 500 };
    if (cri_buff_3rd > 500) { cri_buff_3rd = 500 };
    
    // 各種ボーナス
    if (card_1st == "NP") {
        if ((np_kind != card_2nd && card_2nd != card_3rd && card_3rd != np_kind) || np_kind == "B") { bbonus_all = 50; }
        if (np_kind == card_2nd && card_2nd == card_3rd && np_kind == "B") { exbonus = 350; bchain_bonus = 20; }
        if (np_kind == card_2nd && card_2nd == card_3rd) { exbonus = 350; };
    } else if(card_2nd == "NP") {
        if ((card_1st != np_kind && np_kind != card_3rd && card_3rd != card_1st) || card_1st == "B") { bbonus_all = 50; }
        if (card_1st == np_kind && np_kind == card_3rd && card_1st == "B") { exbonus = 350; bchain_bonus = 20; }
        if (card_1st == np_kind && np_kind == card_3rd) { exbonus = 350; };
    } else if(card_3rd == "NP") {
        if ((card_1st != card_2nd && card_2nd != np_kind && np_kind != card_1st) || card_1st == "B") { bbonus_all = 50; }
        if (card_1st == card_2nd && card_2nd == np_kind && card_1st == "B") { exbonus = 350; bchain_bonus = 20; }
        if (card_1st == card_2nd && card_2nd == np_kind) { exbonus = 350; };
    } else {
        if (card_1st == card_2nd && card_2nd == card_3rd && card_1st == "B") { exbonus = 350; bchain_bonus = 20; }
        if (card_1st == card_2nd && card_2nd == card_3rd) { exbonus = 350; };
        if ((card_1st != card_2nd && card_2nd != card_3rd && card_3rd != card_1st) || card_1st == "B") { bbonus_all = 50; }
    };

    // 1st計算
    if (card_1st == "NP") {
        dmg_ave_1st = calcNpDmg(atk, np_dmg, np_kind, np_card_buff, class_affinity, class_servant, attribute_affinity, atk_buff_1st,
            supereffective_buff_1st, np_buff, supereffective_np, fixed_dmg_1st, special_def_1st, 1);
        dmg_min_1st = calcNpDmg(atk, np_dmg, np_kind, np_card_buff, class_affinity, class_servant, attribute_affinity, atk_buff_1st,
            supereffective_buff_1st, np_buff, supereffective_np, fixed_dmg_1st, special_def_1st, 0.9);
        dmg_max_1st = calcNpDmg(atk, np_dmg, np_kind, np_card_buff, class_affinity, class_servant, attribute_affinity, atk_buff_1st,
            supereffective_buff_1st, np_buff, supereffective_np, fixed_dmg_1st, special_def_1st, 1.099);
    } else {
        dmg_ave_1st = calcDmg(atk_1st, atk_buff_1st, card_buff_1st, cri_buff_1st, bbonus_1st, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 1, 0, supereffective_buff_1st, special_def_1st, fixed_dmg_1st, 1);
        dmg_min_1st = calcDmg(atk_1st, atk_buff_1st, card_buff_1st, cri_buff_1st, bbonus_1st, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 1, 0, supereffective_buff_1st, special_def_1st, fixed_dmg_1st, 0.9);
        dmg_max_1st = calcDmg(atk_1st, atk_buff_1st, card_buff_1st, cri_buff_1st, bbonus_1st, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 1, 0, supereffective_buff_1st, special_def_1st, fixed_dmg_1st, 1.099);
        dmg_cri_ave_1st = calcDmg(atk_1st, atk_buff_1st, card_buff_1st, cri_buff_1st, bbonus_1st, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 2, 1, supereffective_buff_1st, special_def_1st, fixed_dmg_1st, 1);
        dmg_cri_min_1st = calcDmg(atk_1st, atk_buff_1st, card_buff_1st, cri_buff_1st, bbonus_1st, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 2, 1, supereffective_buff_1st, special_def_1st, fixed_dmg_1st, 0.9);
        dmg_cri_max_1st = calcDmg(atk_1st, atk_buff_1st, card_buff_1st, cri_buff_1st, bbonus_1st, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 2, 1, supereffective_buff_1st, special_def_1st, fixed_dmg_1st, 1.099);
    };

    // 2nd計算
    if (card_2nd == "NP") {
        dmg_ave_2nd = calcNpDmg(atk, np_dmg, np_kind, np_card_buff, class_affinity, class_servant, attribute_affinity, atk_buff_2nd,
            supereffective_buff_2nd, np_buff, supereffective_np, fixed_dmg_2nd, special_def_2nd, 1);
        dmg_min_2nd = calcNpDmg(atk, np_dmg, np_kind, np_card_buff, class_affinity, class_servant, attribute_affinity, atk_buff_2nd,
            supereffective_buff_2nd, np_buff, supereffective_np, fixed_dmg_2nd, special_def_2nd, 0.9);
        dmg_max_2nd = calcNpDmg(atk, np_dmg, np_kind, np_card_buff, class_affinity, class_servant, attribute_affinity, atk_buff_2nd,
            supereffective_buff_2nd, np_buff, supereffective_np, fixed_dmg_2nd, special_def_2nd, 1.099);
    } else {
        dmg_ave_2nd = calcDmg(atk_2nd, atk_buff_2nd, card_buff_2nd, cri_buff_2nd, bbonus_2nd, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 1, 0, supereffective_buff_2nd, special_def_2nd, fixed_dmg_2nd, 1);
        dmg_min_2nd = calcDmg(atk_2nd, atk_buff_2nd, card_buff_2nd, cri_buff_2nd, bbonus_2nd, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 1, 0, supereffective_buff_2nd, special_def_2nd, fixed_dmg_2nd, 0.9);
        dmg_max_2nd = calcDmg(atk_2nd, atk_buff_2nd, card_buff_2nd, cri_buff_2nd, bbonus_2nd, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 1, 0, supereffective_buff_2nd, special_def_2nd, fixed_dmg_2nd, 1.099);
        dmg_cri_ave_2nd = calcDmg(atk_2nd, atk_buff_2nd, card_buff_2nd, cri_buff_2nd, bbonus_2nd, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 2, 1, supereffective_buff_2nd, special_def_2nd, fixed_dmg_2nd, 1);
        dmg_cri_min_2nd = calcDmg(atk_2nd, atk_buff_2nd, card_buff_2nd, cri_buff_2nd, bbonus_2nd, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 2, 1, supereffective_buff_2nd, special_def_2nd, fixed_dmg_2nd, 0.9);
        dmg_cri_max_2nd = calcDmg(atk_2nd, atk_buff_2nd, card_buff_2nd, cri_buff_2nd, bbonus_2nd, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 2, 1, supereffective_buff_2nd, special_def_2nd, fixed_dmg_2nd, 1.099);
    }

    // 3rd計算
    if (card_3rd == "NP") {
        dmg_ave_3rd = calcNpDmg(atk, np_dmg, np_kind, np_card_buff, class_affinity, class_servant, attribute_affinity, atk_buff_3rd,
            supereffective_buff_3rd, np_buff, supereffective_np, fixed_dmg_3rd, special_def_3rd, 1);
        dmg_min_3rd = calcNpDmg(atk, np_dmg, np_kind, np_card_buff, class_affinity, class_servant, attribute_affinity, atk_buff_3rd,
            supereffective_buff_3rd, np_buff, supereffective_np, fixed_dmg_3rd, special_def_3rd, 0.9);
        dmg_max_3rd = calcNpDmg(atk, np_dmg, np_kind, np_card_buff, class_affinity, class_servant, attribute_affinity, atk_buff_3rd,
            supereffective_buff_3rd, np_buff, supereffective_np, fixed_dmg_3rd, special_def_3rd, 1.099);
    } else {
        dmg_ave_3rd = calcDmg(atk_3rd, atk_buff_3rd, card_buff_3rd, cri_buff_3rd, bbonus_3rd, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 1, 0, supereffective_buff_3rd, special_def_3rd, fixed_dmg_3rd, 1);
        dmg_min_3rd = calcDmg(atk_3rd, atk_buff_3rd, card_buff_3rd, cri_buff_3rd, bbonus_3rd, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 1, 0, supereffective_buff_3rd, special_def_3rd, fixed_dmg_3rd, 0.9);
        dmg_max_3rd = calcDmg(atk_3rd, atk_buff_3rd, card_buff_3rd, cri_buff_3rd, bbonus_3rd, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 1, 0, supereffective_buff_3rd, special_def_3rd, fixed_dmg_3rd, 1.099);
        dmg_cri_ave_3rd = calcDmg(atk_3rd, atk_buff_3rd, card_buff_3rd, cri_buff_3rd, bbonus_3rd, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 2, 1, supereffective_buff_3rd, special_def_3rd, fixed_dmg_3rd, 1);
        dmg_cri_min_3rd = calcDmg(atk_3rd, atk_buff_3rd, card_buff_3rd, cri_buff_3rd, bbonus_3rd, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 2, 1, supereffective_buff_3rd, special_def_3rd, fixed_dmg_3rd, 0.9);
        dmg_cri_max_3rd = calcDmg(atk_3rd, atk_buff_3rd, card_buff_3rd, cri_buff_3rd, bbonus_3rd, bbonus_all, bchain_bonus, 100,
            class_affinity, class_servant, attribute_affinity, 2, 1, supereffective_buff_3rd, special_def_3rd, fixed_dmg_3rd, 1.099);
    }

    // EX計算
    dmg_ave_EX = calcDmg(atk, atk_buff_ex, ex_atk_buff, cri_buff, 100, bbonus_all, 0, exbonus,
        class_affinity, class_servant, attribute_affinity, 1, 0, supereffective_buff_ex, special_def_ex, fixed_dmg_ex, 1);
    dmg_min_EX = calcDmg(atk, atk_buff_ex, ex_atk_buff, cri_buff, 100, bbonus_all, 0, exbonus,
        class_affinity, class_servant, attribute_affinity, 1, 0, supereffective_buff_ex, special_def_ex, fixed_dmg_ex, 0.9);
    dmg_max_EX = calcDmg(atk, atk_buff_ex, ex_atk_buff, cri_buff, 100, bbonus_all, 0, exbonus,
        class_affinity, class_servant, attribute_affinity, 1, 0, supereffective_buff_ex, special_def_ex, fixed_dmg_ex, 1.099);
    
    // 1stダメージ有無・クリティカル有無を設定
    if (card_1st != "NP" && card_1st_cri == "Y") {
        dmg_ave_1st = dmg_cri_ave_1st;
        dmg_min_1st = dmg_cri_min_1st;
        dmg_max_1st = dmg_cri_max_1st;
    } else if (card_1st_cri == "zero") {
        dmg_ave_1st = 0;
        dmg_min_1st = 0;
        dmg_max_1st = 0;
    };

    // 2ndダメージ有無・クリティカル有無を設定
    if (card_2nd != "NP" && card_2nd_cri == "Y") {
        dmg_ave_2nd = dmg_cri_ave_2nd;
        dmg_min_2nd = dmg_cri_min_2nd;
        dmg_max_2nd = dmg_cri_max_2nd;
    } else if (card_2nd_cri == "zero") {
        dmg_ave_2nd = 0;
        dmg_min_2nd = 0;
        dmg_max_2nd = 0;
        };

    // 3rdダメージ有無・クリティカル有無を設定
    if (card_3rd != "NP" && card_3rd_cri == "Y") {
        dmg_ave_3rd = dmg_cri_ave_3rd;
        dmg_min_3rd = dmg_cri_min_3rd;
        dmg_max_3rd = dmg_cri_max_3rd;
    } else if (card_3rd_cri == "zero") {
        dmg_ave_3rd = 0;
        dmg_min_3rd = 0;
        dmg_max_3rd = 0;
    };

    // EXダメージ有無を設定
    if (ex_cri == "zero") {
        dmg_ave_EX = 0;
        dmg_min_EX = 0;
        dmg_max_EX = 0;
    };

    // 計算結果を反映
    $("#dmg_min_1st").text(Number(rounddown(dmg_min_1st,0)).toLocaleString());
    $("#dmg_ave_1st").text(Number(rounddown(dmg_ave_1st,0)).toLocaleString());
    $("#dmg_max_1st").text(Number(rounddown(dmg_max_1st,0)).toLocaleString());
    $("#dmg_min_2nd").text(Number(rounddown(dmg_min_2nd,0)).toLocaleString());
    $("#dmg_ave_2nd").text(Number(rounddown(dmg_ave_2nd,0)).toLocaleString());
    $("#dmg_max_2nd").text(Number(rounddown(dmg_max_2nd,0)).toLocaleString());
    $("#dmg_min_3rd").text(Number(rounddown(dmg_min_3rd,0)).toLocaleString());
    $("#dmg_ave_3rd").text(Number(rounddown(dmg_ave_3rd,0)).toLocaleString());
    $("#dmg_max_3rd").text(Number(rounddown(dmg_max_3rd,0)).toLocaleString());
    $("#dmg_min_ex").text(Number(rounddown(dmg_min_EX,0)).toLocaleString());
    $("#dmg_ave_ex").text(Number(rounddown(dmg_ave_EX,0)).toLocaleString());
    $("#dmg_max_ex").text(Number(rounddown(dmg_max_EX,0)).toLocaleString());
    $("#dmg_min_total").text(Number(Math.floor(dmg_min_1st) + Math.floor(dmg_min_2nd) + Math.floor(dmg_min_3rd) + Math.floor(dmg_min_EX)).toLocaleString());
    $("#dmg_ave_total").text(Number(Math.floor(dmg_ave_1st) + Math.floor(dmg_ave_2nd) + Math.floor(dmg_ave_3rd) + Math.floor(dmg_ave_EX)).toLocaleString());
    $("#dmg_max_total").text(Number(Math.floor(dmg_max_1st) + Math.floor(dmg_max_2nd) + Math.floor(dmg_max_3rd) + Math.floor(dmg_max_EX)).toLocaleString());

}

/**
 * 宝具ダメージ計算
 * @param atk ATK
 * @param np_dmg 宝具威力
 * @param np_kind 宝具種類
 * @param card_buff カードバフ
 * @param class_affinity クラス相性
 * @param class_servant クラス補正
 * @param attribute_affinity 属性相性
 * @param atk_buff 攻撃バフ
 * @param supereffective_buff 特攻威力バフ
 * @param np_buff 宝具バフ
 * @param supereffective_np 特攻宝具倍率
 * @param fixed_dmg 固定ダメージ
 * @param special_def 敵特殊耐性
 * @param random 乱数
 * @return 宝具ダメージ計算結果を返す
 */
function calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, attribute_affinity, atk_buff,
    supereffective_buff, np_buff, supereffective_np, fixed_dmg, special_def, random) {

    var dmg;

    dmg = (atk * np_dmg / 100
        * 0.23 * card_list[np_kind] //宝具色補正
        * (100 + card_buff) / 100
        * class_affinity // クラス相性
        * class_servant // クラス補正
        * attribute_affinity // Attri相性
        * random // 乱数
        * (100 + atk_buff) / 100 //攻撃バフ
        * Math.max((100 + supereffective_buff + np_buff), 0.1) / 100
        * Math.max(0, 1.0 - Math.min(5.0, Math.max(0, 1.0 + special_def / 100) - 1.0))
        * supereffective_np / 100);

    dmg = dmg + fixed_dmg;

    return dmg;

}

/**
 * 通常攻撃ダメージ計算
 * @param atk ATK
 * @param atk_buff 攻撃バフ
 * @param card_buff カードバフ
 * @param cri_buff クリティカルバフ
 * @param bbonus カード選択順補正
 * @param bbonus_all 1stB or マイティチェインによる補正
 * @param bchain_bonus Bチェイン補正
 * @param ex_bonus EX補正値
 * @param class_affinity クラス相性
 * @param class_servant クラス補正
 * @param attribute_affinity 属性相性
 * @param cri_flag クリティカル有無
 * @param cri_valid クリティカル有効or向こう
 * @param supereffective_buff 特攻威力バフ
 * @param special_def 敵特殊耐性
 * @param fixed_dmg 固定ダメージ
 * @param random 乱数
 * @return 通常攻撃ダメージ計算結果を返す
 */
function calcDmg(atk, atk_buff, card_buff, cri_buff, bbonus, bbonus_all, bchain_bonus, ex_bonus,
    class_affinity, class_servant, attribute_affinity, cri_flag, cri_valid,
    supereffective_buff, special_def, fixed_dmg, random) {
    
    var dmg;

    dmg = (atk * 0.23 *
        (bbonus / 100 * (100 + card_buff) / 100 + bbonus_all / 100)
        * class_affinity // クラス相性
        * class_servant // クラス補正
        * attribute_affinity // Attri相性
        * random // 乱数
        * (100 + atk_buff) / 100 // 攻撃バフ
        * cri_flag // クリティカルの有無
        * ex_bonus / 100
        * Math.max((100 + supereffective_buff + cri_buff * cri_valid), 0.1) / 100
        * Math.max(0, 1.0 - Math.min(5.0, Math.max(0, 1.0 + special_def / 100) - 1.0)) // 特殊耐性
    );

    dmg = dmg + atk * bchain_bonus / 100 + fixed_dmg;

    return dmg;

}

/**
 * 切り捨て
 * @param num 数値
 * @param digit 桁
 * @return 桁で切り捨てされた数値
 */
function rounddown(num, digit) {
    var digitVal = Math.pow(10, digit);
    return (Math.floor(num * digitVal) / digitVal).toFixed(digit);
}

/**
 * 計算結果を撃破率計算にコピー
 * @param tabNumber コピー対象タブ
 */
 function copyProbInput(tabNumber) {
    var card_1st, card_2nd, card_3rd, np_kind, atk, atk_b_buff, fixed_dmg,
        advanced_fixed_dmg_1st, advanced_fixed_dmg_2nd, advanced_fixed_dmg_3rd, advanced_fixed_dmg_Ex, bchain_bonus;

    atk = 0;
    atk_b_buff = 0;
    fixed_dmg = 0;
    advanced_fixed_dmg_1st = 0;
    advanced_fixed_dmg_2nd = 0;
    advanced_fixed_dmg_3rd = 0;
    advanced_fixed_dmg_Ex = 0;

    // Bチェインボーナス分の反映
    card_1st = $("#card_1st_" + tabNumber).val()
    card_2nd = $("#card_2nd_" + tabNumber).val()
    card_3rd = $("#card_3rd_" + tabNumber).val()
    np_kind = $("#np_kind_" + tabNumber).val();
    if ($("#atk_" + tabNumber).val() != "") { atk = parseFloat($("#atk_" + tabNumber).val()); }
    if ($("#b_footprints_" + tabNumber).val() != "") { atk_b_buff = parseFloat($("#b_footprints_" + tabNumber).val()); }
    if ($("#fixed_dmg_" + tabNumber).val() != "") { fixed_dmg = parseFloat($("#fixed_dmg_" + tabNumber).val()); }
    if ($("#advanced_fixed_dmg_1st_" + tabNumber).val() != "") { advanced_fixed_dmg_1st = parseFloat($("#advanced_fixed_dmg_1st_" + tabNumber).val()); }
    if ($("#advanced_fixed_dmg_2nd_" + tabNumber).val() != "") { advanced_fixed_dmg_2nd = parseFloat($("#advanced_fixed_dmg_2nd_" + tabNumber).val()); }
    if ($("#advanced_fixed_dmg_3rd_" + tabNumber).val() != "") { advanced_fixed_dmg_3rd = parseFloat($("#advanced_fixed_dmg_3rd_" + tabNumber).val()); }
    if ($("#advanced_fixed_dmg_Ex_" + tabNumber).val() != "") { advanced_fixed_dmg_Ex = parseFloat($("#advanced_fixed_dmg_Ex_" + tabNumber).val()); }
    bchain_bonus = 0;

    if (card_1st == "NP") {
        if (np_kind == card_2nd && card_2nd == card_3rd && np_kind == "B") { bchain_bonus = 20; atk = atk + atk_b_buff; }
    } else if(card_2nd == "NP") {
        if (card_1st == np_kind && np_kind == card_3rd && card_1st == "B") { bchain_bonus = 20; atk = atk + atk_b_buff; }
    } else if(card_3rd == "NP") {
        if (card_1st == card_2nd && card_2nd == np_kind && card_1st == "B") { bchain_bonus = 20; atk = atk + atk_b_buff; }
    } else {
        if (card_1st == card_2nd && card_2nd == card_3rd && card_1st == "B") { bchain_bonus = 20; atk = atk + atk_b_buff; }
    };

    if ($("#card_1st_cri_" + tabNumber).val() == "zero") {
        $("#dmg_1st").val("0");
        $("#fixed_1st").val("0");
    } else {
        $("#dmg_1st").val(Number($("#dmg_ave_1st").text().replace(/,/g, "")));
        if (card_1st != "NP") {
            $("#fixed_1st").val(fixed_dmg + advanced_fixed_dmg_1st + atk * bchain_bonus / 100);
        } else {
            $("#fixed_1st").val(fixed_dmg);
        }
    };

    if ($("#card_2nd_cri_" + tabNumber).val() == "zero") {
        $("#dmg_2nd").val("0");
        $("#fixed_2nd").val("0");
    } else {
        $("#dmg_2nd").val(Number($("#dmg_ave_2nd").text().replace(/,/g, "")));
        if (card_2nd != "NP") {
            $("#fixed_2nd").val(fixed_dmg + advanced_fixed_dmg_2nd + atk * bchain_bonus / 100);
        } else {
            $("#fixed_2nd").val(fixed_dmg);
        }
    };

    if ($("#card_3rd_cri_" + tabNumber).val() == "zero") {
        $("#dmg_3rd").val("0");
        $("#fixed_3rd").val("0");
    } else {
        $("#dmg_3rd").val(Number($("#dmg_ave_3rd").text().replace(/,/g, "")));
        if (card_3rd != "NP") {
            $("#fixed_3rd").val(fixed_dmg + advanced_fixed_dmg_3rd + atk * bchain_bonus / 100);
        } else {
            $("#fixed_3rd").val(fixed_dmg);
        }
    };
    
    if ($("#ex_cri_" + tabNumber).val() == "zero") {
        $("#dmg_Ex").val("0");
        $("#fixed_Ex").val("0");
    } else {
        $("#dmg_Ex").val($("#dmg_ave_ex").text().replace(/,/g, ""));
        $("#fixed_Ex").val(fixed_dmg + advanced_fixed_dmg_Ex);
    };

    $("#dmg_total").text(Number(parseFloat($("#dmg_1st").val()) + parseFloat($("#dmg_2nd").val()) + parseFloat($("#dmg_3rd").val()) + parseFloat($("#dmg_Ex").val())).toLocaleString());
    $("#fixed_total").text(Number(parseFloat($("#fixed_1st").val()) + parseFloat($("#fixed_2nd").val()) + parseFloat($("#fixed_3rd").val()) + parseFloat($("#fixed_Ex").val())).toLocaleString());

}

/**
 * 撃破率計算
 */
function calcProb() {
    var dmg_1st, dmg_2nd, dmg_3rd, dmg_Ex, buff_1st, buff_2nd, buff_3rd, buff_Ex, enemy_hp;

    dmg_1st = 0;
    dmg_2nd = 0;
    dmg_3rd = 0;
    dmg_Ex = 0;
    buff_1st = 0;
    buff_2nd = 0;
    buff_3rd = 0;
    buff_Ex = 0;
    enemy_hp = 0;

    if ($("#dmg_1st").val() != "") { dmg_1st = parseFloat($("#dmg_1st").val()); }
    if ($("#dmg_2nd").val() != "") { dmg_2nd = parseFloat($("#dmg_2nd").val()); }
    if ($("#dmg_3rd").val() != "") { dmg_3rd = parseFloat($("#dmg_3rd").val()); }
    if ($("#dmg_Ex").val() != "") { dmg_Ex = parseFloat($("#dmg_Ex").val()); }
    $("#dmg_total").text(Number(dmg_1st + dmg_2nd + dmg_3rd + dmg_Ex).toLocaleString());
 
    if ($("#fixed_1st").val() != "") { buff_1st = parseFloat($("#fixed_1st").val()); }
    if ($("#fixed_2nd").val() != "") { buff_2nd = parseFloat($("#fixed_2nd").val()); }
    if ($("#fixed_3rd").val() != "") { buff_3rd = parseFloat($("#fixed_3rd").val()); }
    if ($("#fixed_Ex").val() != "") { buff_Ex = parseFloat($("#fixed_Ex").val()); }
    $("#fixed_total").text(Number(buff_1st + buff_2nd + buff_3rd + buff_Ex).toLocaleString());

    if ($("#enemy_hp").val() != "") { enemy_hp = parseFloat($("#enemy_hp").val()); }

    var rand = new Array(200);
    for (let cnt = 0; cnt < 200; cnt++) {
        rand[cnt] = 0.9 + 0.001 * cnt;
    }

    var first = new Array(40000);
    var second = new Array(40000);
    for (let x = 0; x < 200; x++) {
        for (let y = 0; y < 200; y++) {
            first[200 * x + y] = calc_damage(dmg_1st, buff_1st, 0, 0, 0, 0, 0, 0, rand[x]) + calc_damage(0, 0, dmg_2nd, buff_2nd, 0, 0, 0, 0, rand[y]);
            second[200 * x + y] = calc_damage(0, 0, 0, 0, dmg_3rd, buff_3rd, 0, 0, rand[x]) + calc_damage(0, 0, 0, 0, 0, 0, dmg_Ex, buff_Ex, rand[y]);
        }
    }
    first.sort((a, b) => a - b);
    second.sort((a, b) => a - b);

    var ret = 0;
    for (let x = 0; x < 40000; x++) {
        ret += 40000 - binarySearch(second, enemy_hp - first[x]);
    }
    ret = ret / (40000 * 4);

    $("#prob_result").text(Math.floor(ret) / 100 + "%");

};

/**
 * ダメージ乱数計算
 */
function calc_damage(l1, s1, l2, s2, l3, s3, l4, s4, rand) {
    return Math.floor((l1 - s1) * rand + s1) + Math.floor((l2 - s2) * rand + s2) + Math.floor((l3 - s3) * rand + s3) + Math.floor((l4 - s4) * rand + s4);
};

/**
 * 2分探索
 * @param arr ソート済みの探索対象配列
 * @param target 探索する値
 * @return 探索結果の添字 見つからなかった場合は-1を返す
 */
function binarySearch(arr, target) {

    let min = -1;
    let max = arr.length;

    while (max - min > 1) {

        let mid = Math.floor((min + max) / 2);

        if (arr[mid] < target) {
            min = mid;
        } else {
            max = mid;
        }
    }

    return max;

}