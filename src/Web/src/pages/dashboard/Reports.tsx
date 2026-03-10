import { DataTable } from "@/components/data-table"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import tableData from "@/app/dashboard/data.json"

export function Reports() {
    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
                <p className="text-muted-foreground">
                    Visualize o desempenho, métricas e dados detalhados do sistema.
                </p>
            </div>

            <div className="@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-0">
                    <ChartAreaInteractive />
                </div>
                <DataTable data={tableData} />
            </div>
        </div>
    )
}
