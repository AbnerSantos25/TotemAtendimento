using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;

namespace Totem.E2ETests.Queue
{
	public class QueueFlowTests : IClassFixture<WebApplicationFactory<Program>>
	{
		private readonly HttpClient _httpClient;

		public QueueFlowTests(WebApplicationFactory<Program> factory)
		{
			_httpClient = factory.WithWebHostBuilder(builder =>
			{
				builder.UseSetting("ASPNETCORE_ENVIRONMENT", "Testing");
			}).CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });
		}

		[Fact(DisplayName = "E2E: O acesso a lista de Filas não é publico - exige autenticação")]
		public async Task GetQueues_WhenAnonumous_ShouldReturn401()
		{
			//Act
			var response = await _httpClient.GetAsync("/api/totem/queue");

			// Assert
			Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
			Assert.Collection(response.Headers.WwwAuthenticate, header => header.Equals("Bearer"));
		}
	}
}
