using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace NotPaylas.Models
{
    public class Sayfa
    {
        [JsonProperty("baslik")]
        public string Baslik { get; set; }

        [JsonProperty("icerik")]
        public string Icerik { get; set; }
    }
}