namespace Totem.Common.Extension
{
    public class JwtSettings
    {
        public string Secret { get; set; }
        public int ExpirationTime { get; set; }

        /// <summary>
        /// Duracao do refresh token e, por consequencia, da sessao. Default de 8h
        /// (um turno) usado quando a chave nao esta configurada.
        /// </summary>
        public int RefreshTokenExpirationHours { get; set; } = 8;
        public string Issuer { get; set; }
        public string ValidAt { get; set; }

    }
}
