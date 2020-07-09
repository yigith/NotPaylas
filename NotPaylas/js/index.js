var notesJson = null;

function status(message) {
    $("#status").text(message);
}

function saveAll() {
    // https://api.jquery.com/each/
    var notlar = [];
    $("#myTab > li.nav-item:not(.li-yeni-sekme)").each(function (index) {
        var title = $(this).text().trim();
        var href = $(this).children(".nav-link").attr("href");
        var content = $(href + " textarea").val();

        notlar.push({ baslik: title, icerik: content });
    });

    var json = JSON.stringify(notlar);
    notesJson = json;

    // veriyi /Notlar/Kaydet adresine postalayacağız
    // bunu yaparken AJAX yöntemini kullanacağız
    $.ajax({
        type: "POST",
        url: "/Notlar/Kaydet",
        data: { veri: json },
        success: function (data) {
            if (data == "başarılı") {
                status("Kaydedildi.");
            }
            else {
                toastr.error("Kaydederken bir hata oluştu.");
            }
        }
    });
}

function focusTabPane(tabId) {
    var panoId = tabId.replace("tab-", "pano-");
    var textarea = $("#" + panoId + " textarea");
    textarea.focus();
    textarea.scrollTop(0);
    textarea.get(0).setSelectionRange(0, 0);
}

function removeAllTabs() {
    $("#myTab > li.nav-item:not(.li-yeni-sekme)").remove();
    $("div.tab-pane").remove();
}

function sekmeEkle(sekmeAd, icerik = "") {
    var sekmeSayisi = $("#myTab > li.nav-item:not(.li-yeni-sekme)").length;
    var sekmeId = "tab-" + (sekmeSayisi + 1);
    var panoId = "pano-" + (sekmeSayisi + 1);

    $("#btnYeniSekme").parent().before('<li class="nav-item"><a class="nav-link" id="' + sekmeId + '" data-toggle="tab" href="#' + panoId + '" role="tab" aria-controls="' + sekmeAd + '" aria-selected="false">' + sekmeAd
        + ' <i class="fas fa-times sekmeKapat"></i></a></li>');

    $("#myTabContent").append('<div class="tab-pane fade" id="' + panoId + '" role="tabpanel" aria-labelledby="' + sekmeId + '"><textarea></textarea></div>');

    // $("#pano-1 textarea").val(icerik);
    if (icerik != "")
        $("#" + panoId + " textarea").val(icerik);

    return sekmeId;
}

function showTab(id) {
    $("#" + id).tab("show");
}

function showNotes(notes) {
    removeAllTabs();
    var tabId = "";
    $.each(notes, function (index, value) {
        tabId = sekmeEkle(value.baslik, value.icerik);
    });

    if (tabId != "")
        showTab(tabId);
}

function loadNotes() {
    $("#loading").show();

    $.ajax({
        type: "GET",
        url: "/Notlar/Getir",
        success: function (data, textStatus, jqXHR) {
            notesJson = jqXHR.responseText;
            showNotes(data);
            $("#loading").hide();
        }
    });
}

/* AUTO REFRESH START */
function isAutoRefresh() {
    return localStorage["autoRefresh"] === "1";
}

function updateAutoRefreshUI() {
    if (isAutoRefresh()) {
        $("#btnToggleAutoRefresh > span > i").addClass(["fa-toggle-on", "text-primary"]).removeClass(["fa-toggle-off", "text-secondary"]);
    }
    else {
        $("#btnToggleAutoRefresh > span > i").addClass(["fa-toggle-off", "text-secondary"]).removeClass(["fa-toggle-on", "text-primary"]);
    }
}

function notifyAutoRefreshChange() {
    if (isAutoRefresh()) {
        toastr.success("Otomatik yenileme açık.");
    }
    else {
        toastr.success("Otomatik yenileme kapalı.");
    }
}

function toggleAutoRefresh() {
    localStorage["autoRefresh"] = isAutoRefresh() ? "0" : "1";
    updateAutoRefreshUI();
    notifyAutoRefreshChange();
}

$("#btnToggleAutoRefresh").click(function (event) {
    event.preventDefault();
    toggleAutoRefresh();
})
/* AUTO REFRESH END   */

/* AUTO SAVE START */
function isAutoSave() {
    return localStorage["autoSave"] === "1";
}

function updateAutoSaveUI() {
    if (isAutoSave()) {
        $("#btnToggleAutoSave > span > i").addClass(["fa-toggle-on", "text-primary"]).removeClass(["fa-toggle-off", "text-secondary"]);
    }
    else {
        $("#btnToggleAutoSave > span > i").addClass(["fa-toggle-off", "text-secondary"]).removeClass(["fa-toggle-on", "text-primary"]);
    }
}

function notifyAutoSaveChange() {
    if (isAutoSave()) {
        toastr.success("Otomatik kaydetme açık.");
    }
    else {
        toastr.success("Otomatik kaydetme kapalı.");
    }
}

function toggleAutoSave() {
    localStorage["autoSave"] = isAutoSave() ? "0" : "1";
    updateAutoSaveUI();
    notifyAutoSaveChange();
}

$("#btnToggleAutoSave").click(function (event) {
    event.preventDefault();
    toggleAutoSave();
})
/* AUTO SAVE END   */

function onNotesChanged() {
    status("Kaydedilmedi.");
    if (isAutoSave()) {
        status("Kaydediliyor..")
        _saveAll();
    }
}

/* SIGNALR START */
var noteHub = $.connection.noteHub;

noteHub.client.pagesChanged = function (json) {
    if (json !== notesJson && isAutoRefresh()) {
        var notes = JSON.parse(json);
        showNotes(notes);
        notesJson = json;
    }
};

$.connection.hub.start();
/* SIGNALR END    */

var clipboard = new ClipboardJS('.btn');
var _saveAll = _.debounce(saveAll, 500);

clipboard.on('success', function (e) {
    //console.info('Action:', e.action);
    //console.info('Text:', e.text);
    //console.info('Trigger:', e.trigger);

    e.clearSelection();
    $("#btnKopyala").popover("show");
    $("#btnKopyala").on("shown.bs.popover", function () {
        setTimeout(function () {
            $("#btnKopyala").popover("hide");
        }, 1000);
    });
});

$("#btnReload").click(function () {
    loadNotes();
});

$("#btnKaydet").click(function () {
    _saveAll();
});

var yeniSayfaNo = 0;
$("#btnYeniSekme").click(function (event) {
    event.preventDefault();

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
    var tabId = sekmeEkle(sekmeAd, "");
    showTab(tabId);
    onNotesChanged();
});

$("#myTabContent").on("input", "textarea", function (event) {
    onNotesChanged();
});

$("#myTab").on("click", ".sekmeKapat", function () {
    var href = $(this).parent().attr("href");
    $(this).closest("li").remove();
    $(href).remove();

    // sildikten sonra ilk sekmeyi aktif hale getirelim
    $("#myTab a[role='tab']").first().tab("show");
    onNotesChanged();
});



$("#myTab").on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
    focusTabPane(e.target.id);
});

$("#btnCloseAll").click(function (event) {
    event.preventDefault();
    removeAllTabs();
    onNotesChanged();
});

updateAutoSaveUI();
updateAutoRefreshUI();
loadNotes();