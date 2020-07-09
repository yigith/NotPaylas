using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using NotPaylas.Models;

namespace NotPaylas.Hubs
{
    public class NoteHub : Hub
    {
        // https://stackoverflow.com/questions/7549179/signalr-posting-a-message-to-a-hub-via-an-action-method/31063193#31063193
        private static IHubContext hubContext = GlobalHost.ConnectionManager.GetHubContext<NoteHub>();

        public static void BroadcastPages(string json)
        {
            hubContext.Clients.All.pagesChanged(json);
        }
    }
}