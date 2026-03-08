import { DataTable } from "@/components/data-table"
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

            {/* Aqui usamos o DataTable importado do dashboard-01 junto com os dados de exemplo */}
            <DataTable data={tableData} />
        </div>
    )
}
