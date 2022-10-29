const card_list = { "B": 1.5, "A": 1.0, "Q": 0.8 }; //宝具色補正

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
     $(document).on("change", "select", function () {
        var tabNumber = $("input[name='tab-radio']:checked").val();

        // 対象行を計算
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

});

/**
 * 行コピー
 * @param copy_from コピー元行
 * @param copy_to コピー先行
 */
 function copyParam(copy_from, copy_to){
    $("#atk_" + copy_to).val($("#atk_" + copy_from).val());
    $("#np_dmg_" + copy_to).val($("#np_dmg_" + copy_from).val());
    $("#np_kind_" + copy_to).val($("#np_kind_" + copy_from).val());
    $("#atk_buff_" + copy_to).val($("#atk_buff_" + copy_from).val());
    $("#card_buff_" + copy_to).val($("#card_buff_" + copy_from).val());
    $("#np_buff_" + copy_to).val($("#np_buff_" + copy_from).val());
    $("#supereffective_buff_" + copy_to).val($("#supereffective_buff_" + copy_from).val());
    $("#supereffective_np_" + copy_to).val($("#supereffective_np_" + copy_from).val());
    $("#fixed_dmg_" + copy_to).val($("#fixed_dmg_" + copy_from).val());
    $("#class_affinity_" + copy_to).val($("#class_affinity_" + copy_from).val());
    $("#class_servant_" + copy_to).val($("#class_servant_" + copy_from).val());
}

/**
 * パラメーター初期化
 * @param row 行番号
 */
 function clearParam(row) {

    $("#atk_" + row).val("");
    $("#np_dmg_" + row).val("");
    $("#np_kind_" + row).val("B");
    $("#atk_buff_" + row).val("");
    $("#card_buff_" + row).val("");
    $("#np_buff_" + row).val("");
    $("#supereffective_buff_" + row).val("");
    $("#supereffective_np_" + row).val("100");
    $("#fixed_dmg_" + row).val("");
    $("#class_affinity_" + row).val("2.0");
    $("#class_servant_" + row).val("1.00");
    $("#dmg_min_disad" + row).val("0");
    $("#dmg_ave_disad" + row).val("0");
    $("#dmg_max_disad" + row).val("0");
    $("#dmg_min_normal" + row).val("0");
    $("#dmg_ave_normal" + row).val("0");
    $("#dmg_max_normal" + row).val("0");
    $("#dmg_min_ad" + row).val("0");
    $("#dmg_ave_ad" + row).val("0");
    $("#dmg_max_ad" + row).val("0");

}

/**
 * 計算メイン処理
 * @param tabNumber 計算対象行
 */
 function calcMain(tabNumber) {
    var atk, np_dmg, np_kind, atk_buff, card_buff, np_buff, supereffective_buff, supereffective_np, fixed_dmg,
    class_affinity, class_servant,
    dmg_min_disad, dmg_ave_disad, dmg_max_disad,
    dmg_min_normal, dmg_ave_normal, dmg_max_normal,
    dmg_min_ad, dmg_ave_ad, dmg_max_ad;

    // 初期化
    atk = 0;
    np_dmg = 0;
    atk_buff = 0;
    card_buff = 0;
    np_buff = 0;
    supereffective_buff = 0;
    supereffective_np = 0;
    fixed_dmg = 0;

    // 計算パラメーター取得
    if ($("#atk_" + tabNumber).val() != "") { atk = parseFloat($("#atk_" + tabNumber).val()); }
    if ($("#np_dmg_" + tabNumber).val() != "") { np_dmg = parseFloat($("#np_dmg_" + tabNumber).val()); }
    np_kind = $("#np_kind_" + tabNumber).val();
    if ($("#atk_buff_" + tabNumber).val() != "") { atk_buff = parseFloat($("#atk_buff_" + tabNumber).val()); }
    if ($("#card_buff_" + tabNumber).val() != "") { card_buff = parseFloat($("#card_buff_" + tabNumber).val()); }
    if ($("#np_buff_" + tabNumber).val() != "") { np_buff = parseFloat($("#np_buff_" + tabNumber).val()); }
    if ($("#supereffective_buff_" + tabNumber).val() != "") { supereffective_buff = parseFloat($("#supereffective_buff_" + tabNumber).val()); }
    if ($("#supereffective_np_" + tabNumber).val() != "") { supereffective_np = parseFloat($("#supereffective_np_" + tabNumber).val()); }
    if ($("#fixed_dmg_" + tabNumber).val() != "") { fixed_dmg = parseFloat($("#fixed_dmg_" + tabNumber).val()); }
    class_affinity = parseFloat($("#class_affinity_" + tabNumber).val());
    class_servant = parseFloat($("#class_servant_" + tabNumber).val());
    

    // 不利計算
    dmg_min_disad = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 0.9, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, 0, 0.9);
    dmg_ave_disad = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 0.9, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, 0, 1);
    dmg_max_disad = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 0.9, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, 0, 1.099);

    // 等倍計算
    dmg_min_normal = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 1, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, 0, 0.9);
    dmg_ave_normal = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 1, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, 0, 1);
    dmg_max_normal = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 1, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, 0, 1.099);

    // 有利計算
    dmg_min_ad = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 1.1, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, 0, 0.9);
    dmg_ave_ad = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 1.1, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, 0, 1);
    dmg_max_ad = calcNpDmg(atk, np_dmg, np_kind, card_buff, class_affinity, class_servant, 1.1, atk_buff,
        supereffective_buff, np_buff, supereffective_np, fixed_dmg, 0, 1.099);

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