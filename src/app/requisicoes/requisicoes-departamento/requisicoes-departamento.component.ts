import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';
import { Departamento } from 'src/app/departamentos/models/departamento.model';
import { DepartamentoService } from 'src/app/departamentos/services/departamento.service';
import { Equipamento } from 'src/app/equipamentos/models/equipamento.model';
import { EquipamentoService } from 'src/app/equipamentos/services/equipamento.service';
import { Funcionario } from 'src/app/funcionarios/models/funcionario.model';
import { FuncionarioService } from 'src/app/funcionarios/services/funcionario.service';
import { Movimentacao } from '../models/movimentacao.model';
import { Requisicao } from '../models/requisicao.model';
import { RequisicaoService } from '../services/requisicao.service';

@Component({
  selector: 'app-requisicoes-departamento',
  templateUrl: './requisicoes-departamento.component.html'
})
export class RequisicoesDepartamentoComponent implements OnInit {
  public requisicoes$: Observable<Requisicao[]>;
  public departamentos$: Observable<Departamento[]>;
  public equipamentos$: Observable<Equipamento[]>;
  private processoAutenticado$: Subscription;

  public funcionarioLogado: Funcionario;
  public requisicaoSelecionada: Requisicao;
  public listaStatus: string[] = ["Aberta", "Processando", "Não Autorizada", "Fechada"];
  public form: FormGroup;

  constructor(
    private authService: AuthenticationService,
    private requisicaoService: RequisicaoService,
    private funcionarioService: FuncionarioService,
    private departamentoService: DepartamentoService,
    private equipamentoService: EquipamentoService,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      status: new FormControl("", [Validators.required]),
      descricao: new FormControl("", [Validators.required, Validators.minLength(6)]),
      funcionario: new FormControl(""),
      data: new FormControl("")
    });

    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();
    this.requisicoes$ = this.requisicaoService.selecionarTodos();

    this.processoAutenticado$ = this.authService.usuarioLogado.subscribe(usuario => {
      const email: string = usuario?.email!;

      this.funcionarioService.selecionarFuncionarioLogado(email)
        .subscribe(funcionario => this.funcionarioLogado = funcionario);
        });
  }

  ngOnDestroy(): void {
    this.processoAutenticado$.unsubscribe();
  }

  get id(): AbstractControl | null {
    return this.form.get("id");
  }

  get status(): AbstractControl | null {
    return this.form.get("status");
  }

  public async gravar(modal: TemplateRef<any>, requisicao: Requisicao) {
    this.requisicaoSelecionada = requisicao;
    this.requisicaoSelecionada.movimentacoes = requisicao.movimentacoes ? requisicao.movimentacoes : [];

    this.form.reset();
    this.configurarValoresPadrao();

    try {
      await this.modalService.open(modal).result;

      if(this.form.dirty && this.form.valid) {
        this.atualizarRequisicao(this.form.value);

        await this.requisicaoService.editar(this.requisicaoSelecionada);

        this.toastrService.success("A requisição foi salva com sucesso.", "Cadastro de Requisição");
      }
      else
        this.toastrService.error("O formulário precisa ser preenchido!", "Cadastro de Requisição")

    } catch (error) {
      if (error != "fechar" && error != "0" && error != "1")
        this.toastrService.error("Houve um erro ao salvar a requisição. Tente novamente.", "Cadastro de Requisição")
    }
  }

  private atualizarRequisicao(movimentacao: Movimentacao) {
    this.requisicaoSelecionada.movimentacoes.push(movimentacao);
    this.requisicaoSelecionada.status = this.status?.value;
    this.requisicaoSelecionada.ultimaAtualizacao = new Date();
  }

  private configurarValoresPadrao(): void {
    this.form.patchValue({
      funcionario: this.funcionarioLogado,
      status: this.requisicaoSelecionada?.status,
      data: new Date()
    });
  }
}
