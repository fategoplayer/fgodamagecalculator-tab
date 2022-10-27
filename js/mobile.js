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
            }
            enableTab = "0";
        }
        else if (e.target.scrollLeft < contents.offsetWidth * 3 / 2) {
            tabRadio[1].checked = true;
            if (enableTab != "1") {
                // 再計算
                calcMain("1");
            }
            enableTab = "1";
        }
        else if (e.target.scrollLeft < contents.offsetWidth * 5 / 2) {
            tabRadio[2].checked = true;
            if (enableTab != "2") {
                // 再計算
                calcMain("2");
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
        var recNumber = $("input[name='tab-radio']:checked").val();

        setTimeout(function(){
            console.log($(".floating-result")[0].offsetHeight);
            /*$(".floating-result").hide().show();*/
        },100);

        // ブランクなら0を入れる
        /*
        if (this.value == "") {
            if (this.id == "atk_" + recNumber) {
                // atkがブランクなら初期化
                clearParam(recNumber);
            }
            else {
                this.value = "0";
            }
        }
        */

        // 対象行を計算
        calcMain(recNumber);
    });

    /**
     * セレクトボックス変更イベント
     */
     $(document).on("change", "select", function () {
        var recNumber = $("input[name='tab-radio']:checked").val();

        // 対象行を計算
        calcMain(recNumber);

    });

    
    $(document).on("focus", "input", function () {

        /*this.select();*/

    });

    /**
     * 撃破率画面表示イベント
     */
    $("#probModal").on("show.bs.modal", function () {

        var recNumber = $("input[name='tab-radio']:checked").val();
        
        // パラメーターを撃破率画面にコピー
        copyProbInput(recNumber);

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

});

/**
 * パラメーター初期化
 * @param row 行番号
 */
 function clearParam(row) {

    $("#atk_" + row).val("");
    $("#np_dmg_" + row).val("");
    $("#np_kind_" + row).val("B");
    $("#atk_buff_" + row).val("");
    $("#b_card_buff_" + row).val("");
    $("#b_card_cri_buff_" + row).val("");
    $("#a_card_buff_" + row).val("");
    $("#a_card_cri_buff_" + row).val("");
    $("#q_card_buff_" + row).val("");
    $("#q_card_cri_buff_" + row).val("");
    $("#cri_buff_" + row).val("");
    $("#np_buff_" + row).val("");
    $("#ex_atk_buff_" + row).val("");
    $("#supereffective_buff_" + row).val("");
    $("#supereffective_np_" + row).val("100");
    $("#fixed_dmg_" + row).val("");
    $("#b_footprints_" + row).val("");
    $("#a_footprints_" + row).val("");
    $("#q_footprints_" + row).val("");
    $("#special_def_" + row).val("");
    $("#advanced_atk_buff_1st_" + row).val("");
    $("#advanced_atk_buff_2nd_" + row).val("");
    $("#advanced_atk_buff_3rd_" + row).val("");
    $("#advanced_atk_buff_Ex_" + row).val("");
    $("#advanced_card_buff_1st_" + row).val("");
    $("#advanced_card_buff_2nd_" + row).val("");
    $("#advanced_card_buff_3rd_" + row).val("");
    $("#advanced_cri_buff_1st_" + row).val("");
    $("#advanced_cri_buff_2nd_" + row).val("");
    $("#advanced_cri_buff_3rd_" + row).val("");
    $("#advanced_supereffective_buff_1st_" + row).val("");
    $("#advanced_supereffective_buff_2nd_" + row).val("");
    $("#advanced_supereffective_buff_3rd_" + row).val("");
    $("#advanced_supereffective_buff_Ex_" + row).val("");
    $("#advanced_fixed_dmg_1st_" + row).val("");
    $("#advanced_fixed_dmg_2nd_" + row).val("");
    $("#advanced_fixed_dmg_3rd_" + row).val("");
    $("#advanced_fixed_dmg_Ex_" + row).val("");
    $("#advanced_special_def_1st_" + row).val("");
    $("#advanced_special_def_2nd_" + row).val("");
    $("#advanced_special_def_3rd_" + row).val("");
    $("#advanced_special_def_Ex_" + row).val("");
    $("#class_affinity_" + row).val("2.0");
    $("#attribute_affinity_" + row).val("1.0");
    $("#class_servant_" + row).val("1.00");
    $("#card_1st_" + row).val("NP");
    $("#card_1st_cri_" + row).val("Y");
    $("#card_2nd_" + row).val("B");
    $("#card_2nd_cri_" + row).val("Y");
    $("#card_3rd_" + row).val("B");
    $("#card_3rd_cri_" + row).val("Y");
    $("#ex_cri_" + row).val("N");
    $("#dmg_min_1st_" + row).val("0");
    $("#dmg_ave_1st_" + row).val("0");
    $("#dmg_max_1st_" + row).val("0");
    $("#dmg_min_2nd_" + row).val("0");
    $("#dmg_ave_2nd_" + row).val("0");
    $("#dmg_max_2nd_" + row).val("0");
    $("#dmg_min_3rd_" + row).val("0");
    $("#dmg_ave_3rd_" + row).val("0");
    $("#dmg_max_3rd_" + row).val("0");
    $("#dmg_min_ex_" + row).val("0");
    $("#dmg_ave_ex_" + row).val("0");
    $("#dmg_max_ex_" + row).val("0");
    $("#dmg_min_total_" + row).val("0");
    $("#dmg_ave_total_" + row).val("0");
    $("#dmg_max_total_" + row).val("0");

}

/**
 * 計算メイン処理
 * @param recNumber 計算対象行
 */
 function calcMain(recNumber) {
    var atk, np_dmg, np_kind, atk_buff, b_card_buff, b_card_cri_buff, a_card_buff, a_card_cri_buff, q_card_buff, q_card_cri_buff,
    cri_buff, np_buff, ex_atk_buff, supereffective_buff, supereffective_np, fixed_dmg, b_footprints, a_footprints, q_footprints,
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
    b_card_buff = 0;
    b_card_cri_buff = 0;
    a_card_buff = 0;
    a_card_buffa_card_buff = 0;
    q_card_buff = 0;
    q_card_cri_buff = 0;
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

    // 計算パラメーター取得
    if ($("#atk_" + recNumber).val() != "") { atk = parseFloat($("#atk_" + recNumber).val()); }
    if ($("#np_dmg_" + recNumber).val() != "") { np_dmg = parseFloat($("#np_dmg_" + recNumber).val()); }
    np_kind = $("#np_kind_" + recNumber).val();
    if ($("#atk_buff_" + recNumber).val() != "") { atk_buff = parseFloat($("#atk_buff_" + recNumber).val()); }
    if ($("#b_card_buff_" + recNumber).val() != "") { b_card_buff = parseFloat($("#b_card_buff_" + recNumber).val()); }
    if ($("#b_card_cri_buff_" + recNumber).val() != "") { b_card_cri_buff = parseFloat($("#b_card_cri_buff_" + recNumber).val()); }
    if ($("#a_card_buff_" + recNumber).val() != "") { a_card_buff = parseFloat($("#a_card_buff_" + recNumber).val()); }
    if ($("#a_card_cri_buff_" + recNumber).val() != "") { a_card_cri_buff = parseFloat($("#a_card_cri_buff_" + recNumber).val()); }
    if ($("#q_card_buff_" + recNumber).val() != "") { q_card_buff = parseFloat($("#q_card_buff_" + recNumber).val()); }
    if ($("#q_card_cri_buff_" + recNumber).val() != "") { q_card_cri_buff = parseFloat($("#q_card_cri_buff_" + recNumber).val()); }
    if ($("#cri_buff_" + recNumber).val() != "") { cri_buff = parseFloat($("#cri_buff_" + recNumber).val()); }
    if ($("#np_buff_" + recNumber).val() != "") { np_buff = parseFloat($("#np_buff_" + recNumber).val()); }
    if ($("#ex_atk_buff_" + recNumber).val() != "") { ex_atk_buff = parseFloat($("#ex_atk_buff_" + recNumber).val()); }
    if ($("#supereffective_buff_" + recNumber).val() != "") { supereffective_buff = parseFloat($("#supereffective_buff_" + recNumber).val()); }
    if ($("#supereffective_np_" + recNumber).val() != "") { supereffective_np = parseFloat($("#supereffective_np_" + recNumber).val()); }
    if ($("#fixed_dmg_" + recNumber).val() != "") { fixed_dmg = parseFloat($("#fixed_dmg_" + recNumber).val()); }
    if ($("#b_footprints_" + recNumber).val() != "") { b_footprints = parseFloat($("#b_footprints_" + recNumber).val()); }
    if ($("#a_footprints_" + recNumber).val() != "") { a_footprints = parseFloat($("#a_footprints_" + recNumber).val()); }
    if ($("#q_footprints_" + recNumber).val() != "") { q_footprints = parseFloat($("#q_footprints_" + recNumber).val()); }
    if ($("#special_def_" + recNumber).val() != "") { special_def = parseFloat($("#special_def_" + recNumber).val()); }
    if ($("#advanced_atk_buff_1st_" + recNumber).val() != "") { advanced_atk_buff_1st = parseFloat($("#advanced_atk_buff_1st_" + recNumber).val()); }
    if ($("#advanced_atk_buff_2nd_" + recNumber).val() != "") { advanced_atk_buff_2nd = parseFloat($("#advanced_atk_buff_2nd_" + recNumber).val()); }
    if ($("#advanced_atk_buff_3rd_" + recNumber).val() != "") { advanced_atk_buff_3rd = parseFloat($("#advanced_atk_buff_3rd_" + recNumber).val()); }
    if ($("#advanced_atk_buff_Ex_" + recNumber).val() != "") { advanced_atk_buff_ex = parseFloat($("#advanced_atk_buff_Ex_" + recNumber).val()); }
    if ($("#advanced_card_buff_1st_" + recNumber).val() != "") { advanced_card_buff_1st = parseFloat($("#advanced_card_buff_1st_" + recNumber).val()); }
    if ($("#advanced_card_buff_2nd_" + recNumber).val() != "") { advanced_card_buff_2nd = parseFloat($("#advanced_card_buff_2nd_" + recNumber).val()); }
    if ($("#advanced_card_buff_3rd_" + recNumber).val() != "") { advanced_card_buff_3rd = parseFloat($("#advanced_card_buff_3rd_" + recNumber).val()); }
    if ($("#advanced_cri_buff_1st_" + recNumber).val() != "") { advanced_cri_buff_1st = parseFloat($("#advanced_cri_buff_1st_" + recNumber).val()); }
    if ($("#advanced_cri_buff_2nd_" + recNumber).val() != "") { advanced_cri_buff_2nd = parseFloat($("#advanced_cri_buff_2nd_" + recNumber).val()); }
    if ($("#advanced_cri_buff_3rd_" + recNumber).val() != "") { advanced_cri_buff_3rd = parseFloat($("#advanced_cri_buff_3rd_" + recNumber).val()); }
    if ($("#advanced_supereffective_buff_1st_" + recNumber).val() != "") { advanced_supereffective_buff_1st = parseFloat($("#advanced_supereffective_buff_1st_" + recNumber).val()); }
    if ($("#advanced_supereffective_buff_2nd_" + recNumber).val() != "") { advanced_supereffective_buff_2nd = parseFloat($("#advanced_supereffective_buff_2nd_" + recNumber).val()); }
    if ($("#advanced_supereffective_buff_3rd_" + recNumber).val() != "") { advanced_supereffective_buff_3rd = parseFloat($("#advanced_supereffective_buff_3rd_" + recNumber).val()); }
    if ($("#advanced_supereffective_buff_Ex_" + recNumber).val() != "") { advanced_supereffective_buff_ex = parseFloat($("#advanced_supereffective_buff_Ex_" + recNumber).val()); }
    if ($("#advanced_fixed_dmg_1st_" + recNumber).val() != "") { advanced_fixed_dmg_1st = parseFloat($("#advanced_fixed_dmg_1st_" + recNumber).val()); }
    if ($("#advanced_fixed_dmg_2nd_" + recNumber).val() != "") { advanced_fixed_dmg_2nd = parseFloat($("#advanced_fixed_dmg_2nd_" + recNumber).val()); }
    if ($("#advanced_fixed_dmg_3rd_" + recNumber).val() != "") { advanced_fixed_dmg_3rd = parseFloat($("#advanced_fixed_dmg_3rd_" + recNumber).val()); }
    if ($("#advanced_fixed_dmg_Ex_" + recNumber).val() != "") { advanced_fixed_dmg_ex = parseFloat($("#advanced_fixed_dmg_Ex_" + recNumber).val()); }
    if ($("#advanced_special_def_1st_" + recNumber).val() != "") { advanced_special_def_1st = parseFloat($("#advanced_special_def_1st_" + recNumber).val()); }
    if ($("#advanced_special_def_2nd_" + recNumber).val() != "") { advanced_special_def_2nd = parseFloat($("#advanced_special_def_2nd_" + recNumber).val()); }
    if ($("#advanced_special_def_3rd_" + recNumber).val() != "") { advanced_special_def_3rd = parseFloat($("#advanced_special_def_3rd_" + recNumber).val()); }
    if ($("#advanced_special_def_Ex_" + recNumber).val() != "") { advanced_special_def_ex = parseFloat($("#advanced_special_def_Ex_" + recNumber).val()); }
    class_affinity = parseFloat($("#class_affinity_" + recNumber).val());
    attribute_affinity = parseFloat($("#attribute_affinity_" + recNumber).val());
    class_servant = parseFloat($("#class_servant_" + recNumber).val());
    card_1st = $("#card_1st_" + recNumber).val();
    card_1st_cri = $("#card_1st_cri_" + recNumber).val();
    card_2nd = $("#card_2nd_" + recNumber).val();
    card_2nd_cri = $("#card_2nd_cri_" + recNumber).val();
    card_3rd = $("#card_3rd_" + recNumber).val();
    card_3rd_cri = $("#card_3rd_cri_" + recNumber).val();
    ex_cri = $("#ex_cri_" + recNumber).val();

    bbonus_all = 0; bchain_bonus = 0; exbonus = 200;

    // カード選択ボーナスを設定
    // 1st
    if (card_1st == "Q") {
        bbonus_1st = 80;
        card_buff_1st = q_card_buff + advanced_card_buff_1st;
        cri_buff_1st = cri_buff + q_card_cri_buff + advanced_cri_buff_1st;
        atk_1st = atk + q_footprints;
    }
    if (card_1st == "A") {
        bbonus_1st = 100;
        card_buff_1st = a_card_buff + advanced_card_buff_1st;
        cri_buff_1st = cri_buff + a_card_cri_buff + advanced_cri_buff_1st;
        atk_1st = atk + a_footprints;
    }
    if (card_1st == "B") {
        bbonus_all = 50;
        bbonus_1st = 150;
        card_buff_1st = b_card_buff + advanced_card_buff_1st;
        cri_buff_1st = cri_buff + b_card_cri_buff + advanced_cri_buff_1st;
        atk_1st = atk + b_footprints;
    }
    if (card_1st == "NP" && np_kind == "Q") {
        np_card_buff = q_card_buff + advanced_card_buff_1st;
        bbonus_1st = 80;
        card_buff_1st = q_card_buff + advanced_card_buff_1st;
        cri_buff_1st = cri_buff + q_card_cri_buff + advanced_cri_buff_1st;
    }
    if (card_1st == "NP" && np_kind == "A") {
        np_card_buff = a_card_buff + advanced_card_buff_1st;
        bbonus_1st = 100;
        card_buff_1st = a_card_buff + advanced_card_buff_1st;
        cri_buff_1st = cri_buff + a_card_cri_buff + advanced_cri_buff_1st;
    }
    if (card_1st == "NP" && np_kind == "B") {
        np_card_buff = b_card_buff + advanced_card_buff_1st;
        bbonus_all = 50;
        bbonus_1st = 150;
        card_buff_1st = b_card_buff + advanced_card_buff_1st;
        cri_buff_1st = cri_buff + b_card_cri_buff + advanced_cri_buff_1st;
    }
    // 2nd
    if (card_2nd == "Q") {
        bbonus_2nd = 96;
        card_buff_2nd = q_card_buff + advanced_card_buff_2nd;
        cri_buff_2nd = cri_buff + q_card_cri_buff + advanced_cri_buff_2nd;
        atk_2nd = atk + q_footprints;
    }
    if (card_2nd == "A") {
        bbonus_2nd = 120;
        card_buff_2nd = a_card_buff + advanced_card_buff_2nd;
        cri_buff_2nd = cri_buff + a_card_cri_buff + advanced_cri_buff_2nd;
        atk_2nd = atk + a_footprints;
    }
    if (card_2nd == "B") {
        bbonus_2nd = 180;
        card_buff_2nd = b_card_buff + advanced_card_buff_2nd;
        cri_buff_2nd = cri_buff + b_card_cri_buff + advanced_cri_buff_2nd;
        atk_2nd = atk + b_footprints;
    }
    if (card_2nd == "NP" && np_kind == "Q") {
        np_card_buff = q_card_buff + advanced_card_buff_2nd;
        bbonus_2nd = 96;
        card_buff_2nd = q_card_buff + advanced_card_buff_2nd;
        cri_buff_2nd = cri_buff + q_card_cri_buff + advanced_cri_buff_2nd;
    }
    if (card_2nd == "NP" && np_kind == "A") {
        np_card_buff = a_card_buff + advanced_card_buff_2nd;
        bbonus_2nd = 120;
        card_buff_2nd = a_card_buff + advanced_card_buff_2nd;
        cri_buff_2nd = cri_buff + a_card_cri_buff + advanced_cri_buff_2nd;
    }
    if (card_2nd == "NP" && np_kind == "B") {
        np_card_buff = b_card_buff + advanced_card_buff_2nd;
        bbonus_2nd = 180;
        card_buff_2nd = b_card_buff + advanced_card_buff_2nd;
        cri_buff_2nd = cri_buff + b_card_cri_buff + advanced_cri_buff_2nd;
    }
    // 3rd
    if (card_3rd == "Q") {
        bbonus_3rd = 112;
        card_buff_3rd = q_card_buff + advanced_card_buff_3rd;
        cri_buff_3rd = cri_buff + q_card_cri_buff + advanced_cri_buff_3rd;
        atk_3rd = atk + q_footprints;
    }
    if (card_3rd == "A") {
        bbonus_3rd = 140;
        card_buff_3rd = a_card_buff + advanced_card_buff_3rd;
        cri_buff_3rd = cri_buff + a_card_cri_buff + advanced_cri_buff_3rd;
        atk_3rd = atk + a_footprints;
    }
    if (card_3rd == "B") {
        bbonus_3rd = 210;
        card_buff_3rd = b_card_buff + advanced_card_buff_3rd;
        cri_buff_3rd = cri_buff + b_card_cri_buff + advanced_cri_buff_3rd;
        atk_3rd = atk + b_footprints;
    }
    if (card_3rd == "NP" && np_kind == "Q") {
        np_card_buff = q_card_buff + advanced_card_buff_3rd;
        bbonus_3rd = 112;
        card_buff_3rd = q_card_buff + advanced_card_buff_3rd;
        cri_buff_3rd = cri_buff + q_card_cri_buff + advanced_cri_buff_3rd;
    }
    if (card_3rd == "NP" && np_kind == "A") {
        np_card_buff = a_card_buff + advanced_card_buff_3rd;
        bbonus_3rd = 140;
        card_buff_3rd = a_card_buff + advanced_card_buff_3rd;
        cri_buff_3rd = cri_buff + a_card_cri_buff + advanced_cri_buff_3rd;
    }
    if (card_3rd == "NP" && np_kind == "B") {
        np_card_buff = b_card_buff + advanced_card_buff_3rd;
        bbonus_3rd = 210;
        card_buff_3rd = b_card_buff + advanced_card_buff_3rd;
        cri_buff_3rd = cri_buff + b_card_cri_buff + advanced_cri_buff_3rd;
    }
    // 1st共通
    atk_buff_1st = atk_buff + advanced_atk_buff_1st;
    supereffective_buff_1st = supereffective_buff + advanced_supereffective_buff_1st;
    fixed_dmg_1st = fixed_dmg + advanced_fixed_dmg_1st;
    special_def_1st = special_def + advanced_special_def_1st;
    // 2nd共通
    atk_buff_2nd = atk_buff + advanced_atk_buff_2nd;
    supereffective_buff_2nd = supereffective_buff + advanced_supereffective_buff_2nd;
    fixed_dmg_2nd = fixed_dmg + advanced_fixed_dmg_2nd;
    special_def_2nd = special_def + advanced_special_def_2nd;
    // 3rd共通
    atk_buff_3rd = atk_buff + advanced_atk_buff_3rd;
    supereffective_buff_3rd = supereffective_buff + advanced_supereffective_buff_3rd;
    fixed_dmg_3rd = fixed_dmg + advanced_fixed_dmg_3rd;
    special_def_3rd = special_def + advanced_special_def_3rd;
    // EX共通
    atk_buff_ex = atk_buff + advanced_atk_buff_ex;
    supereffective_buff_ex = supereffective_buff + advanced_supereffective_buff_ex;
    fixed_dmg_ex = fixed_dmg + advanced_fixed_dmg_ex;
    special_def_ex = special_def + advanced_special_def_ex;
    
    
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
 * @param recNumber コピー対象行
 */
 function copyProbInput(recNumber) {
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
    card_1st = $("#card_1st_" + recNumber).val()
    card_2nd = $("#card_2nd_" + recNumber).val()
    card_3rd = $("#card_3rd_" + recNumber).val()
    np_kind = $("#np_kind_" + recNumber).val();
    if ($("#atk_" + recNumber).val() != "") { atk = parseFloat($("#atk_" + recNumber).val()); }
    if ($("#b_footprints_" + recNumber).val() != "") { atk_b_buff = parseFloat($("#b_footprints_" + recNumber).val()); }
    if ($("#fixed_dmg_" + recNumber).val() != "") { fixed_dmg = parseFloat($("#fixed_dmg_" + recNumber).val()); }
    if ($("#advanced_fixed_dmg_1st_" + recNumber).val() != "") { advanced_fixed_dmg_1st = parseFloat($("#advanced_fixed_dmg_1st_" + recNumber).val()); }
    if ($("#advanced_fixed_dmg_2nd_" + recNumber).val() != "") { advanced_fixed_dmg_2nd = parseFloat($("#advanced_fixed_dmg_2nd_" + recNumber).val()); }
    if ($("#advanced_fixed_dmg_3rd_" + recNumber).val() != "") { advanced_fixed_dmg_3rd = parseFloat($("#advanced_fixed_dmg_3rd_" + recNumber).val()); }
    if ($("#advanced_fixed_dmg_Ex_" + recNumber).val() != "") { advanced_fixed_dmg_Ex = parseFloat($("#advanced_fixed_dmg_Ex_" + recNumber).val()); }
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

    if ($("#card_1st_cri_" + recNumber).val() == "zero") {
        $("#dmg_1st").val("0");
        $("#fixed_1st").val("0");
    } else {
        $("#dmg_1st").val(Number($("#dmg_ave_1st").text().replace(/,/g, "")));
        if (card_1st != "NP") {
            $("#fixed_1st").val(fixed_dmg + advanced_fixed_dmg_1st + atk * bchain_bonus / 100);
        } else {
            $("#fixed_1st").val("0");
        }
    };

    if ($("#card_2nd_cri_" + recNumber).val() == "zero") {
        $("#dmg_2nd").val("0");
        $("#fixed_2nd").val("0");
    } else {
        $("#dmg_2nd").val(Number($("#dmg_ave_2nd").text().replace(/,/g, "")));
        if (card_2nd != "NP") {
            $("#fixed_2nd").val(fixed_dmg + advanced_fixed_dmg_2nd + atk * bchain_bonus / 100);
        } else {
            $("#fixed_2nd").val("0");
        }
    };

    if ($("#card_3rd_cri_" + recNumber).val() == "zero") {
        $("#dmg_3rd").val("0");
        $("#fixed_3rd").val("0");
    } else {
        $("#dmg_3rd").val(Number($("#dmg_ave_3rd").text().replace(/,/g, "")));
        if (card_3rd != "NP") {
            $("#fixed_3rd").val(fixed_dmg + advanced_fixed_dmg_3rd + atk * bchain_bonus / 100);
        } else {
            $("#fixed_3rd").val("0");
        }
    };
    
    if ($("#ex_cri_" + recNumber).val() == "zero") {
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
    var dmg_1st, dmg_2nd, dmg_3rd, dmg_Ex, buff_1st, buff_2nd, buff_3rd, buff_Ex;

    dmg_1st = parseFloat($("#dmg_1st").val());
    dmg_2nd = parseFloat($("#dmg_2nd").val());
    dmg_3rd = parseFloat($("#dmg_3rd").val());
    dmg_Ex = parseFloat($("#dmg_Ex").val());
    $("#dmg_total").val(Number(parseFloat($("#dmg_1st").val()) + parseFloat($("#dmg_2nd").val()) + parseFloat($("#dmg_3rd").val()) + parseFloat($("#dmg_Ex").val())).toLocaleString());
 
    buff_1st = parseFloat($("#fixed_1st").val());
    buff_2nd = parseFloat($("#fixed_2nd").val());
    buff_3rd = parseFloat($("#fixed_3rd").val());
    buff_Ex = parseFloat($("#fixed_Ex").val());
    $("#fixed_total").val(Number(parseFloat($("#fixed_1st").val()) + parseFloat($("#fixed_2nd").val()) + parseFloat($("#fixed_3rd").val()) + parseFloat($("#fixed_Ex").val())).toLocaleString());

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

    var enemy_hp = parseFloat($("#enemy_hp").val());
    var ret = 0;
    for (let x = 0; x < 40000; x++) {
        ret += 40000 - binarySearch(second, enemy_hp - first[x]);
    }
    ret = ret / (40000 * 4);

    //$("#prob_result").val(Math.floor(ret) / 100 + "%")

    $("#probress-prob").css("width", Math.floor(ret) / 100 + "%");
    $("#probress-prob").attr("aria-valuenow", Math.floor(ret) / 100 + "%");
    $("#probress-prob").text(Math.floor(ret) / 100 + "%");

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