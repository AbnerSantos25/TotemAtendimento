import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "@/components/ui/table";

export interface TableSkeletonProps {
    /** Número de colunas que a tabela possui (padrão: 3) */
    columns?: number;
    /** Número de linhas de skeleton para exibir (padrão: 5) */
    rows?: number;
}

export function TableSkeleton({ columns = 3, rows = 5 }: TableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                    {Array.from({ length: columns }).map((_, colIndex) => {
                        // Fazemos a última coluna alinhar os itens à direita, seguindo o padrão de Ações
                        const isLastColumn = colIndex === columns - 1;
                        
                        return (
                            <TableCell key={colIndex} className={isLastColumn ? "text-right" : ""}>
                                {isLastColumn ? (
                                    <div className="flex justify-end items-center gap-4">
                                        <Skeleton className="h-4 w-12 md:w-20" />
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                    </div>
                                ) : (
                                    <Skeleton 
                                        // Varia o tamanho do skeleton baseado na coluna para ficar mais natural
                                        className={`h-4 ${colIndex === 0 ? 'w-[150px] md:w-[250px]' : 'w-[80px] md:w-[120px]'} ${colIndex === 1 ? 'rounded-full' : ''}`} 
                                    />
                                )}
                            </TableCell>
                        );
                    })}
                </TableRow>
            ))}
        </>
    );
}
