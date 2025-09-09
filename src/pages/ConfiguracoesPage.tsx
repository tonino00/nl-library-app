import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSave, FiSettings, FiDatabase, FiLock, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const PageTitle = styled.h1`
  font-size: 1.75rem;
  color: var(--text-color);
  margin-bottom: 20px;
`;

const ConfigSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: var(--text-color);
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: var(--primary-color);
  }
`;

const SectionDescription = styled.p`
  color: var(--light-text-color);
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const ConfiguracoesPage: React.FC = () => {
  // Estado para configurações gerais
  const [apiUrl, setApiUrl] = useState('http://localhost:5000/api');
  const [diasEmprestimo, setDiasEmprestimo] = useState('7');
  const [limiteRenovacoes, setLimiteRenovacoes] = useState('2');
  const [valorMultaDiaria, setValorMultaDiaria] = useState('0.50');
  
  // Estado para configurações de backup
  const [backupAutomatico, setBackupAutomatico] = useState('true');
  const [intervaloBackup, setIntervaloBackup] = useState('7');
  
  // Simulação de salvamento das configurações
  const handleSaveConfig = () => {
    toast.success('Configurações salvas com sucesso!');
  };
  
  // Simulação de backup manual
  const handleBackupNow = () => {
    toast.info('Backup iniciado. Este processo pode levar alguns minutos...');
    
    // Simular conclusão do backup após 2 segundos
    setTimeout(() => {
      toast.success('Backup concluído com sucesso!');
    }, 2000);
  };
  
  // Simulação de restauração de sistema
  const handleRestoreSystem = () => {
    if (window.confirm('Tem certeza que deseja restaurar o sistema? Esta ação não pode ser desfeita.')) {
      toast.info('Restauração iniciada. Este processo pode levar alguns minutos...');
      
      // Simular conclusão da restauração após 3 segundos
      setTimeout(() => {
        toast.success('Sistema restaurado com sucesso!');
      }, 3000);
    }
  };

  return (
    <div>
      <PageTitle>Configurações do Sistema</PageTitle>
      
      <ConfigSection>
        <Card>
          <SectionTitle><FiSettings size={20} /> Configurações Gerais</SectionTitle>
          <SectionDescription>
            Configure os parâmetros gerais do sistema de biblioteca.
          </SectionDescription>
          
          <FormGroup>
            <Input
              label="URL da API"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              fullWidth
            />
          </FormGroup>
          
          <FormRow>
            <Input
              label="Dias Padrão para Empréstimo"
              type="number"
              min="1"
              max="30"
              value={diasEmprestimo}
              onChange={(e) => setDiasEmprestimo(e.target.value)}
              fullWidth
            />
            
            <Input
              label="Limite de Renovações"
              type="number"
              min="0"
              max="5"
              value={limiteRenovacoes}
              onChange={(e) => setLimiteRenovacoes(e.target.value)}
              fullWidth
            />
            
            <Input
              label="Valor da Multa Diária (R$)"
              type="number"
              step="0.01"
              min="0"
              value={valorMultaDiaria}
              onChange={(e) => setValorMultaDiaria(e.target.value)}
              fullWidth
            />
          </FormRow>
          
          <ButtonsContainer>
            <Button
              variant="primary"
              leftIcon={<FiSave />}
              onClick={handleSaveConfig}
            >
              Salvar Configurações
            </Button>
          </ButtonsContainer>
        </Card>
      </ConfigSection>
      
      <ConfigSection>
        <Card>
          <SectionTitle><FiDatabase size={20} /> Backup e Restauração</SectionTitle>
          <SectionDescription>
            Configure as opções de backup do sistema e realize operações de manutenção.
          </SectionDescription>
          
          <FormRow>
            <Select
              label="Backup Automático"
              value={backupAutomatico}
              onChange={(e) => setBackupAutomatico(e.target.value)}
              options={[
                { value: 'true', label: 'Ativado' },
                { value: 'false', label: 'Desativado' }
              ]}
              fullWidth
            />
            
            <Input
              label="Intervalo entre Backups (dias)"
              type="number"
              min="1"
              max="30"
              value={intervaloBackup}
              onChange={(e) => setIntervaloBackup(e.target.value)}
              disabled={backupAutomatico !== 'true'}
              fullWidth
            />
          </FormRow>
          
          <ButtonsContainer>
            <Button
              variant="primary"
              leftIcon={<FiSave />}
              onClick={handleSaveConfig}
            >
              Salvar Configurações
            </Button>
            <Button
              variant="secondary"
              leftIcon={<FiDatabase />}
              onClick={handleBackupNow}
            >
              Realizar Backup Agora
            </Button>
          </ButtonsContainer>
        </Card>
      </ConfigSection>
      
      <ConfigSection>
        <Card>
          <SectionTitle><FiLock size={20} /> Segurança e Manutenção</SectionTitle>
          <SectionDescription>
            Operações avançadas de manutenção e segurança do sistema.
          </SectionDescription>
          
          <ButtonsContainer>
            <Button
              variant="danger"
              leftIcon={<FiRefreshCw />}
              onClick={handleRestoreSystem}
            >
              Restaurar Sistema para Estado Inicial
            </Button>
          </ButtonsContainer>
        </Card>
      </ConfigSection>
    </div>
  );
};

export default ConfiguracoesPage;
