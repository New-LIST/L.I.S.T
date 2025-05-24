// File: Utils/HttpContextExtensions.cs
using System.Linq;
using System.Net;
using System.Net.Sockets;
using Microsoft.AspNetCore.Http;

namespace List.Common.Utils
{
    public static class HttpContextExtensions
    {
        /// <summary>
        /// Získa klientsku IP adresu vždy ako IPv4 (fallbackuje na 127.0.0.1 alebo 0.0.0.0).
        /// </summary>
        public static string GetClientIpAddress(this HttpContext context)
        {
            // 1) skús header X-Forwarded-For
            var forwarded = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(forwarded))
            {
                var first = forwarded.Split(',')[0].Trim();
                if (IPAddress.TryParse(first, out var parsed))
                {
                    if (parsed.Equals(IPAddress.IPv6Loopback))
                        return IPAddress.Loopback.ToString();      // "::1" -> "127.0.0.1"

                    if (parsed.AddressFamily == AddressFamily.InterNetworkV6 
                        && parsed.IsIPv4MappedToIPv6)
                        return parsed.MapToIPv4().ToString();      // "::ffff:x.x.x.x" -> "x.x.x.x"

                    if (parsed.AddressFamily == AddressFamily.InterNetwork)
                        return parsed.ToString();                  // už IPv4

                    // ostatné IPv6 fallback
                    return IPAddress.Loopback.ToString();
                }

                // neparsovateľné -> fallback
                return "0.0.0.0";
            }

            // 2) fallback na Connection.RemoteIpAddress
            var ip = context.Connection.RemoteIpAddress;
            if (ip == null)
                return "0.0.0.0";

            if (ip.Equals(IPAddress.IPv6Loopback))
                return IPAddress.Loopback.ToString();

            if (ip.AddressFamily == AddressFamily.InterNetworkV6 
                && ip.IsIPv4MappedToIPv6)
                return ip.MapToIPv4().ToString();

            if (ip.AddressFamily == AddressFamily.InterNetwork)
                return ip.ToString();

            // čisté IPv6 fallback
            return IPAddress.Loopback.ToString();
        }
    }
}
