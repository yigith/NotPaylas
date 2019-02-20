$("#btnKaydet").click(function () {
    // https://api.jquery.com/each/
    var notlar = [];
    $("#myTab > li.nav-item:not(.li-yeni-sekme)").each(function (index) {
        var title = $(this).text().trim();
        var href = $(this).children(".nav-link").attr("href");
        var content = $(href + " textarea").val();

        notlar.push({ baslik: title, icerik: content });
    });

    var data = JSON.stringify(notlar);

    // veriyi /Notlar/Kaydet adresine postalayacağız
    // bunu yaparken AJAX yöntemini kullanacağız
    $.ajax({
        type: "POST",
        url: "/Notlar/Kaydet",
        data: { veri: data },
        success: function (result) {
            alert(result);
        }
    });
});



var yeniSayfaNo = 0;
$("#btnYeniSekme").click(function () {
    // Sayfa Başlığına Karar Verilme Kısmı
    var sekmeAd = prompt("Sayfa başlığı:");

    if (sekmeAd == null) {
        return;
    }

    if (sekmeAd.trim() == "") {
        sekmeAd = "Yeni Sayfa" +
            (yeniSayfaNo == 0 ? "" : " " + yeniSayfaNo);

        yeniSayfaNo++;
    }

    // Yeni Sekmenin Eklenme Kısmı
    sekmeEkle(sekmeAd);
});

function sekmeEkle(sekmeAd, icerik = "") {
    var sekmeSayisi = $("#myTab > li.nav-item:not(.li-yeni-sekme)").length;
    var sekmeId = "tab-" + (sekmeSayisi + 1);
    var panoId = "pano-" + (sekmeSayisi + 1);

    $("#btnYeniSekme").parent().before('<li class="nav-item"><a class="nav-link" id="' + sekmeId + '" data-toggle="tab" href="#' + panoId + '" role="tab" aria-controls="' + sekmeAd + '" aria-selected="false">' + sekmeAd
        + ' <i class="fas fa-times sekmeKapat"></i></a></li>');

    $("#myTabContent").append('<div class="tab-pane fade" id="' + panoId + '" role="tabpanel" aria-labelledby="' + sekmeId + '"><textarea></textarea></div>');

    // $("#pano-1 textarea").val(icerik);
    $("#" + panoId + " textarea").val(icerik);

    $("#" + sekmeId).tab("show");
}

$("#myTab").on("click", ".sekmeKapat", function () {
    var href = $(this).parent().attr("href");
    $(this).closest("li").remove();
    $(href).remove();

    // sildikten sonra ilk sekmeyi aktif hale getirelim
    $("#myTab a[role='tab']").first().tab("show");
});

$.ajax({
    type: "GET",
    url: "/Notlar/Getir",
    success: function (result) {
        var notlar = JSON.parse(result);

        $.each(notlar, function (index, value) {
            sekmeEkle(value.baslik, value.icerik);
        });
    }
});