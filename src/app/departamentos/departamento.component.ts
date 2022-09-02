import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { Departamento } from './models/departamento.model';
import { DepartamentoService } from './services/departamento.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-departamento',
  templateUrl: './departamento.component.html'
})
export class DepartamentoComponent implements OnInit {
  public departamentos$: Observable<Departamento[]>;
  public form: FormGroup;

  constructor(
    private departamentoService: DepartamentoService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastrService: ToastrService
    ) { }

  ngOnInit(): void {
    this.departamentos$ = this.departamentoService.selecionarTodos();

    this.form = this.fb.group({
      id: new FormControl(""),
      nome: new FormControl("", [Validators.required, Validators.minLength(3)]),
      telefone: new FormControl("", [Validators.required, Validators.minLength(16)])
    })
  }

  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get id(): AbstractControl | null {
    return this.form.get("id");
  }

  get nome(): AbstractControl | null {
    return this.form.get("nome");
  }

  get telefone(): AbstractControl | null {
    return this.form.get("telefone");
  }

  public async gravar(modal: TemplateRef<any>, departamento?: Departamento) {
    this.form.reset();

    if (departamento)
      this.form.setValue(departamento);

    try {
      await this.modalService.open(modal).result;

      if(this.form.dirty && this.form.valid) {
        if (!departamento)
          await this.departamentoService.inserir(this.form.value)
        else
          await this.departamentoService.editar(this.form.value);

        this.toastrService.success("O departamento foi salvo com sucesso.", "Cadastro de Departamento");
      }
      else
        this.toastrService.error("O formulário precisa ser preenchido!", "Cadastro de Departamento")

    } catch (error) {
      if (error != "fechar" && error != "0" && error != "1")
        this.toastrService.error("Houve um erro ao salvar o departamento. Tente novamente.", "Cadastro de Departamento")
    }

  }

  public excluir(departamento: Departamento) {
    try {
      this.departamentoService.excluir(departamento);

      this.toastrService.success("O departamento foi excluido com sucesso.", "Cadastro de Departamento");
    } catch (error){
      this.toastrService.error("Houve um erro ao excluir o departamento. Tente novamente.", "Cadastro de Departamento")
    }
  }
}
