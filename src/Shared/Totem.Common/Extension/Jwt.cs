namespace Totem.Common.Extension
{
    public class JwtSettings
    {
        public string Secret { get; set; }
        public int ExpirationTime { get; set; }
        public string Issuer { get; set; }
        public string ValidAt { get; set; }

    }
}
