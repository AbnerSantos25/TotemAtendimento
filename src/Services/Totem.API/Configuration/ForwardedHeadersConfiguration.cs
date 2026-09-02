using Microsoft.AspNetCore.HttpOverrides;
using System.Net;

namespace Totem.API.Configuration
{
    /// <summary>
    /// Atras de um reverse proxy, o Connection.RemoteIpAddress passa a ser o IP do
    /// proxy, e nao o do cliente. Como o rate limiter particiona por IP de origem,
    /// isso colocaria todos os usuarios no mesmo balde.
    ///
    /// Confiar em X-Forwarded-For sem restricao, porem, seria pior: qualquer cliente
    /// poderia forjar o cabecalho e trocar de IP a cada requisicao, anulando por
    /// completo a protecao de forca bruta do login. Por isso o encaminhamento so vale
    /// para os proxies declarados em configuracao -- sem eles, o ASP.NET Core mantem
    /// o padrao de aceitar apenas loopback.
    /// </summary>
    public static class ForwardedHeadersConfiguration
    {
        public static IServiceCollection AddForwardedHeadersConfiguration(
            this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;

                // Numero de proxies encadeados cujo cabecalho deve ser considerado.
                options.ForwardLimit = configuration.GetValue<int?>("ForwardedHeaders:ForwardLimit") ?? 1;

                var proxies = ParseAddresses(configuration.GetSection("ForwardedHeaders:KnownProxies").Get<string[]>());
                var networks = ParseNetworks(configuration.GetSection("ForwardedHeaders:KnownNetworks").Get<string[]>());

                // So substitui o padrao (apenas loopback) se houver ao menos uma entrada
                // valida. Do contrario um placeholder mal copiado deixaria a aplicacao sem
                // nenhum proxy confiavel, que e pior do que nao configurar nada.
                if (proxies.Count == 0 && networks.Count == 0)
                    return;

                options.KnownProxies.Clear();
                options.KnownNetworks.Clear();

                foreach (var proxy in proxies)
                    options.KnownProxies.Add(proxy);

                foreach (var network in networks)
                    options.KnownNetworks.Add(network);
            });

            return services;
        }

        private static List<IPAddress> ParseAddresses(string[]? values)
        {
            var parsed = new List<IPAddress>();

            foreach (var value in values ?? [])
            {
                if (IPAddress.TryParse(value, out var address))
                    parsed.Add(address);
            }

            return parsed;
        }

        private static List<Microsoft.AspNetCore.HttpOverrides.IPNetwork> ParseNetworks(string[]? values)
        {
            var parsed = new List<Microsoft.AspNetCore.HttpOverrides.IPNetwork>();

            foreach (var value in values ?? [])
            {
                // Formato CIDR, ex.: "10.0.0.0/8".
                var parts = value.Split('/', 2);

                if (parts.Length == 2
                    && IPAddress.TryParse(parts[0], out var prefix)
                    && int.TryParse(parts[1], out var prefixLength))
                {
                    parsed.Add(new Microsoft.AspNetCore.HttpOverrides.IPNetwork(prefix, prefixLength));
                }
            }

            return parsed;
        }
    }
}
