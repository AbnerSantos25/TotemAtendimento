import { useState, useEffect } from "react";
import { AGShowMessage } from "@/components/AGShowMessage";
import { serviceLocationService } from "@/services/ServiceLocationService";
import type { ServiceLocationView } from "@/models/ServiceLocationModels";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, MapPin, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/TableSkeleton";

export function ServiceLocationConfiguration() {
    const [locations, setLocations] = useState<ServiceLocationView[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newNumber, setNewNumber] = useState<string>("");

    const [locationIDToEdit, setLocationIdToEdit] = useState<string | null>(null);

    const [locationToDelete, setLocationToDelete] = useState<{ id: string, name: string } | null>(null);

    const fetchLocations = async () => {
        setLoading(true);
        const response = await serviceLocationService.getListAsync();

        if (response.success && response.data) {
            setLocations(response.data);
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: "Erro na Busca", description: response.error.message || "Falha ao carregar locais." });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const filteredLocations = locations.filter(loc => {
        if (searchTerm && !loc.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const openAddDialog = () => {
        setLocationIdToEdit(null);
        setNewName("");
        setNewNumber("");
        setIsDialogOpen(true);
    };

    const openEditDialog = (loc: ServiceLocationView) => {
        setLocationIdToEdit(loc.id);
        setNewName(loc.name);
        setNewNumber(loc.number !== null && loc.number !== undefined ? loc.number.toString() : "");
        setIsDialogOpen(true);
    };

    const handleSaveLocation = async () => {
        if (!newName.trim()) {
            AGShowMessage.warning({ title: "Atenção", description: "O nome do local é obrigatório." });
            return;
        }

        const parsedNumber = newNumber.trim() ? parseInt(newNumber, 10) : null;
        const dto = { id: locationIDToEdit, name: newName, number: parsedNumber };

        if (locationIDToEdit) {
            const response = await serviceLocationService.updateAsync(locationIDToEdit, dto);
            if (response.success && response.data) {
                AGShowMessage.success({ title: "Sucesso", description: "Local atualizado com sucesso." });
                setLocations(prev => prev.map(loc => loc.id === locationIDToEdit ? dto as ServiceLocationView : loc));
            } else if (!response.success && response.error) {
                AGShowMessage.error({ title: "Erro na Atualização", description: response.error.message || "Não foi possível atualizar o local." });
            }
        } else {
            const response = await serviceLocationService.addAsync(dto);
            if (response.success && response.data) {
                AGShowMessage.success({ title: "Sucesso", description: "Local criado com sucesso." });
                
                const novoLocal: ServiceLocationView = {
                    id: response.data,
                    name: dto.name,
                    number: dto.number
                };
                
                setLocations(prev => [...prev, novoLocal]);
            } else if (!response.success && response.error) {
                AGShowMessage.error({ title: "Erro na Criação", description: response.error.message || "Não foi possível criar o local." });
            }
        }

        setIsDialogOpen(false);
    };

    const handleDeleteLocation = async () => {
        if (!locationToDelete) return;

        const response = await serviceLocationService.deleteAsync(locationToDelete.id);

        if (response.success) {
            AGShowMessage.success({ title: "Removido", description: "O local foi removido com sucesso." });
            setLocations(prev => prev.filter(loc => loc.id !== locationToDelete.id));
        } else if (!response.success && response.error) {
            AGShowMessage.error({ title: "Erro na Exclusão", description: response.error.message || "Não foi possível remover o local." });
        }
        setLocationToDelete(null);
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Locais de Atendimento</h2>
                    <p className="text-muted-foreground">Adicione e remova guichês, salas e consultórios.</p>
                </div>
                <Button onClick={openAddDialog} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Novo Local
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Locais Cadastrados</CardTitle>
                    <CardDescription>Gerencie seus pontos de atendimento físicos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 max-w-md">
                        <Input
                            placeholder="Buscar local por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Número</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableSkeleton columns={3} rows={4} />
                                ) : filteredLocations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="p-0">
                                            <EmptyState
                                                title="Nenhum local encontrado"
                                                description="Cadastre guichês ou salas para o sistema fluir."
                                                icon={<MapPin className="h-12 w-12 text-muted-foreground/50 mb-2" />}
                                                action={
                                                    <Button variant="outline" onClick={openAddDialog}>
                                                        <Plus className="mr-2 h-4 w-4" /> Criar Local
                                                    </Button>
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLocations.map((loc) => (
                                        <TableRow key={loc.id}>
                                            <TableCell className="font-medium">{loc.name}</TableCell>
                                            <TableCell>{loc.number !== null && loc.number !== undefined ? loc.number : "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-primary"
                                                        onClick={() => openEditDialog(loc)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => setLocationToDelete({ id: loc.id, name: loc.name })}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{locationIDToEdit ? "Editar Local" : "Adicionar Novo Local"}</DialogTitle>
                        <DialogDescription>
                            {locationIDToEdit ? "Altere os dados deste ponto de atendimento." : "Configure o ponto de atendimento (Ex: Guichê, Sala, Consultório)."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome do Local</Label>
                            <Input
                                id="name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Ex: Guichê"
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="number">Número (Opcional)</Label>
                            <Input
                                id="number"
                                type="number"
                                value={newNumber}
                                onChange={(e) => setNewNumber(e.target.value)}
                                placeholder="Ex: 5"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveLocation}>
                            {locationIDToEdit ? "Salvar Alterações" : "Salvar Local"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!locationToDelete}
                onOpenChange={(open) => !open && setLocationToDelete(null)}
                title="Confirmar Exclusão"
                description={`Tem certeza que deseja remover o local "${locationToDelete?.name}"? Esta ação não pode ser desfeita.`}
                onConfirm={handleDeleteLocation}
                confirmText="Confirmar Exclusão"
            />
        </div>
    );
}
