﻿using Newtonsoft.Json;
using NotPaylas.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace NotPaylas.Controllers
{
    public class NotlarController : Controller
    {
        public string VeriDosyaYolu => Server.MapPath("~/App_Data/veri.json");

        // siteismi.com/Notlar/Kaydet
        [HttpPost]
        [ValidateInput(false)]
        public ActionResult Kaydet(string veri)
        {
            string dosyaYolu =
                Server.MapPath("~/App_Data/veri.json");

            System.IO.File.WriteAllText(dosyaYolu, veri);

            return Json("başarılı");
        }

        // siteismi.com/Notlar/Getir
        public ActionResult Getir()
        {
            string veri = System.IO.File.ReadAllText(VeriDosyaYolu);

            return Content(veri, "application/json");
        }

        // siteismi.com/Notlar/NotEkle
        [HttpPost]
        [ValidateInput(false)]
        public ActionResult NotEkle(Sayfa sayfa)
        {
            string veri = System.IO.File.ReadAllText(VeriDosyaYolu);
            var sayfalar = JsonConvert.DeserializeObject<List<Sayfa>>(veri);
            sayfalar.Add(sayfa);
            string json = JsonConvert.SerializeObject(sayfalar);

            System.IO.File.WriteAllText(VeriDosyaYolu, json);

            return Json("başarılı");
        }

        public ActionResult TumunuSil()
        {
            System.IO.File.WriteAllText(VeriDosyaYolu, "[]");
            return Redirect(Url.Content("~/"));
        }
    }
}