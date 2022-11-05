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

        // 対象行を計算
        calcMain(tabNumber);
    });

    /**
     * セレクトボックス変更イベント
     */
     $(document).on("change", ".calc-inp-tbl select", function () {
        var tabNumber = $("input[name='tab-radio']:checked").val();

        // 対象行を計算
        calcMain(tabNumber);

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
                switch (this["宝具カード"]) {
                    case "B" :
                        if (this["クラススキル_Bバフ"] != "0"){
                            $("#card_buff_" + tabNumber).val(this["クラススキル_Bバフ"]);
                        }
                        break;
                    case "A" :
                        if (this["クラススキル_Aバフ"] != "0") {
                            $("#card_buff_" + tabNumber).val(this["クラススキル_Aバフ"]);
                        }
                        break;
                    case "Q" :
                        if (this["クラススキル_Qバフ"] != "0") {
                            $("#card_buff_" + tabNumber).val(this["クラススキル_Qバフ"]);
                        }
                        break;
                    default :
                        break;
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
                $("#servant_SW_" + tabNumber).val(this["SW"]);
                $("#servant_AHIT_" + tabNumber).val(this["AHIT"]);
                $("#servant_QHIT_" + tabNumber).val(this["QHIT"]);
                $("#servant_BHIT_" + tabNumber).val(this["BHIT"]);
                $("#servant_EXHIT_" + tabNumber).val(this["EXHIT"]);
                $("#servant_NHIT_" + tabNumber).val(this["NHIT"]);

            }

        });

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
 * @param copy_from コピー元行
 * @param copy_to コピー先行
 */
 function copyParam(copy_from, copy_to){
    $("#servant_name_" + copy_to).val($("#servant_name_" + copy_from).val());
    $("#atk_" + copy_to).val($("#atk_" + copy_from).val());
    $("#np_dmg_" + copy_to).val($("#np_dmg_" + copy_from).val());
    $("#np_kind_" + copy_to).val($("#np_kind_" + copy_from).val());
    $("#atk_buff_" + copy_to).val($("#atk_buff_" + copy_from).val());
    $("#def_debuff_" + copy_to).val($("#def_debuff_" + copy_from).val());
    $("#card_buff_" + copy_to).val($("#card_buff_" + copy_from).val());
    $("#card_debuff_" + copy_to).val($("#card_debuff_" + copy_from).val());
    $("#np_buff_" + copy_to).val($("#np_buff_" + copy_from).val());
    $("#supereffective_buff_" + copy_to).val($("#supereffective_buff_" + copy_from).val());
    $("#supereffective_np_" + copy_to).val($("#supereffective_np_" + copy_from).val());
    $("#fixed_dmg_" + copy_to).val($("#fixed_dmg_" + copy_from).val());
    $("#special_def_" + copy_to).val($("#special_def_" + copy_from).val());
    $("#class_affinity_" + copy_to).val($("#class_affinity_" + copy_from).val());
    $("#class_servant_" + copy_to).val($("#class_servant_" + copy_from).val());
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
    $("#servant_SW_" + copy_to).val($("#servant_SW_" + copy_from).val());
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
    $("#card_buff_" + tabNumber).val("");
    $("#card_debuff_" + tabNumber).val("");
    $("#np_buff_" + tabNumber).val("");
    $("#supereffective_buff_" + tabNumber).val("");
    $("#supereffective_np_" + tabNumber).val("100");
    $("#fixed_dmg_" + tabNumber).val("");
    $("#special_def_" + tabNumber).val("");
    $("#class_affinity_" + tabNumber).val("2.0");
    $("#class_servant_" + tabNumber).val("1.00");
    $("#dmg_min_disad" + tabNumber).val("0");
    $("#dmg_ave_disad" + tabNumber).val("0");
    $("#dmg_max_disad" + tabNumber).val("0");
    $("#dmg_min_normal" + tabNumber).val("0");
    $("#dmg_ave_normal" + tabNumber).val("0");
    $("#dmg_max_normal" + tabNumber).val("0");
    $("#dmg_min_ad" + tabNumber).val("0");
    $("#dmg_ave_ad" + tabNumber).val("0");
    $("#dmg_max_ad" + tabNumber).val("0");
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
    $("#servant_SW_" + tabNumber).val("");
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
    var atk, np_dmg, np_kind, atk_buff, def_debuff, card_buff, card_debuff, np_buff, supereffective_buff, supereffective_np, fixed_dmg,
    special_def, class_affinity, class_servant,
    dmg_min_disad, dmg_ave_disad, dmg_max_disad,
    dmg_min_normal, dmg_ave_normal, dmg_max_normal,
    dmg_min_ad, dmg_ave_ad, dmg_max_ad;

    // 初期化
    atk = 0;
    np_dmg = 0;
    atk_buff = 0;
    def_debuff = 0;
    card_buff = 0;
    card_debuff = 0;
    np_buff = 0;
    supereffective_buff = 0;
    supereffective_np = 0;
    fixed_dmg = 0;
    special_def = 0;

    // 計算パラメーター取得
    if ($("#atk_" + tabNumber).val() != "") { atk = parseFloat($("#atk_" + tabNumber).val()); }
    if ($("#np_dmg_" + tabNumber).val() != "") { np_dmg = parseFloat($("#np_dmg_" + tabNumber).val()); }
    np_kind = $("#np_kind_" + tabNumber).val();
    if ($("#atk_buff_" + tabNumber).val() != "") { atk_buff = parseFloat($("#atk_buff_" + tabNumber).val()); }
    if ($("#def_debuff_" + tabNumber).val() != "") { def_debuff = parseFloat($("#def_debuff_" + tabNumber).val()); }
    if ($("#card_buff_" + tabNumber).val() != "") { card_buff = parseFloat($("#card_buff_" + tabNumber).val()); }
    if ($("#card_debuff_" + tabNumber).val() != "") { card_debuff = parseFloat($("#card_debuff_" + tabNumber).val()); }
    if ($("#np_buff_" + tabNumber).val() != "") { np_buff = parseFloat($("#np_buff_" + tabNumber).val()); }
    if ($("#supereffective_buff_" + tabNumber).val() != "") { supereffective_buff = parseFloat($("#supereffective_buff_" + tabNumber).val()); }
    if ($("#supereffective_np_" + tabNumber).val() != "") { supereffective_np = parseFloat($("#supereffective_np_" + tabNumber).val()); }
    if ($("#fixed_dmg_" + tabNumber).val() != "") { fixed_dmg = parseFloat($("#fixed_dmg_" + tabNumber).val()); }
    if ($("#special_def_" + tabNumber).val() != "") { special_def = parseFloat($("#special_def_" + tabNumber).val()); }
    class_affinity = parseFloat($("#class_affinity_" + tabNumber).val());
    class_servant = parseFloat($("#class_servant_" + tabNumber).val());

    // 上限チェック
    if (atk_buff > 400) { atk_buff = 400 };
    if (atk_buff < -100) { atk_buff = -100 };
    if (def_debuff > 100) { def_debuff = 100 };
    if (card_buff > 400) { card_buff = 400 };
    if (supereffective_buff > 1000) { supereffective_buff = 1000 };
    if (np_buff > 500) { np_buff = 500 };

    // デバフ合算
    atk_buff = atk_buff + def_debuff;
    card_buff = card_buff + card_debuff;

    // 不利計算
    dmg_min_disad = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 0.9, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, special_def, 0.9);
    dmg_ave_disad = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 0.9, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, special_def, 1);
    dmg_max_disad = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 0.9, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, special_def, 1.099);

    // 等倍計算
    dmg_min_normal = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 1, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, special_def, 0.9);
    dmg_ave_normal = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 1, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, special_def, 1);
    dmg_max_normal = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 1, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, special_def, 1.099);

    // 有利計算
    dmg_min_ad = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 1.1, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, special_def, 0.9);
    dmg_ave_ad = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 1.1, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, special_def, 1);
    dmg_max_ad = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 1.1, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, special_def, 1.099);

    // 計算結果を反映
    $("#dmg_min_disad").text(Number(rounddown(dmg_min_disad,0)).toLocaleString());
    $("#dmg_ave_disad").text(Number(rounddown(dmg_ave_disad,0)).toLocaleString());
    $("#dmg_max_disad").text(Number(rounddown(dmg_max_disad,0)).toLocaleString());
    $("#dmg_min_normal").text(Number(rounddown(dmg_min_normal,0)).toLocaleString());
    $("#dmg_ave_normal").text(Number(rounddown(dmg_ave_normal,0)).toLocaleString());
    $("#dmg_max_normal").text(Number(rounddown(dmg_max_normal,0)).toLocaleString());
    $("#dmg_min_ad").text(Number(rounddown(dmg_min_ad,0)).toLocaleString());
    $("#dmg_ave_ad").text(Number(rounddown(dmg_ave_ad,0)).toLocaleString());
    $("#dmg_max_ad").text(Number(rounddown(dmg_max_ad,0)).toLocaleString());

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