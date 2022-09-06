import { Departamento } from "src/app/departamentos/models/departamento.model";
import { Equipamento } from "src/app/equipamentos/models/equipamento.model";
import { Funcionario } from "src/app/funcionarios/models/funcionario.model";

export class Requisicao {
  id: string;
  departamentoId: string;
  departamento?: Departamento;
  descricao: string;
  equipamentoId: string;
  equipamento?: Equipamento;
  dataAbertura: Date;
}
