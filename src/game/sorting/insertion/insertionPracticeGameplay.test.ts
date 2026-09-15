import { describe, it, expect } from "vitest";
import {
  createInsertionSortState,
  executeInsertionStep,
  calculateInsertionSortProgress,
  getInsertionPracticeConstraints,
  generateInsertionPracticeArray,
  INSERTION_PRACTICE_CATALOG,
  getInsertionPracticeDefinition,
  getNextInsertionPracticeLevel,
  getInsertionStepFeedback,
  getInsertionContextualHint,
  type InsertionPracticeLevel,
} from "./index";
import { calculateProtocolScore } from "../../session/protocolScore";

describe("Insertion Sort - Práticas Interativas e Gameplay (P2.2-D)", () => {
  describe("Nomenclatura e Catálogo de Práticas", () => {
    it("não expõe 'fase' na API do Insertion, utilizando apenas 'practice'", () => {
      const levels: InsertionPracticeLevel[] = ["basic", "intermediate", "advanced"];
      expect(levels).toHaveLength(3);

      const basicDef = getInsertionPracticeDefinition("basic");
      expect(basicDef.id).toBe("insertion.practice.basic");
      expect(basicDef.title).toBe("PRÁTICA BÁSICA");
      expect(basicDef.size).toBe(4);

      const intermediateDef = getInsertionPracticeDefinition("intermediate");
      expect(intermediateDef.id).toBe("insertion.practice.intermediate");
      expect(intermediateDef.title).toBe("PRÁTICA INTERMEDIÁRIA");
      expect(intermediateDef.size).toBe(5);

      const advancedDef = getInsertionPracticeDefinition("advanced");
      expect(advancedDef.id).toBe("insertion.practice.advanced");
      expect(advancedDef.title).toBe("PRÁTICA AVANÇADA");
      expect(advancedDef.size).toBe(6);
    });

    it("assegura a cadeia estrita de progressão: basic -> intermediate -> advanced -> null", () => {
      expect(getNextInsertionPracticeLevel("basic")).toBe("intermediate");
      expect(getNextInsertionPracticeLevel("intermediate")).toBe("advanced");
      expect(getNextInsertionPracticeLevel("advanced")).toBeNull();
    });
  });

  describe("Geração Procedural e Reset de Prática", () => {
    it("gera arrays com os tamanhos exatos mapeados para cada nível de prática", () => {
      const basic = generateInsertionPracticeArray("basic");
      expect(basic.values).toHaveLength(4);
      const constraints = getInsertionPracticeConstraints("basic");
      expect(constraints.length).toBeGreaterThan(0);

      const intermediate = generateInsertionPracticeArray("intermediate");
      expect(intermediate.values).toHaveLength(5);

      const advanced = generateInsertionPracticeArray("advanced");
      expect(advanced.values).toHaveLength(6);
    });

    it("respeita seed fixa para reprodução idêntica de lote", () => {
      const seed = "test-practice-seed";
      const run1 = generateInsertionPracticeArray("basic", seed);
      const run2 = generateInsertionPracticeArray("basic", seed);
      expect(run1.values).toEqual(run2.values);
    });

    it("simula reinício de exercício mantendo o MESMO vetor original e resetando engine", () => {
      const initialArray = [30, 20, 10, 40];
      const state1 = createInsertionSortState(initialArray);

      // Usuário comete um erro ou avança um passo
      const step1 = executeInsertionStep(state1, "SHIFT_RIGHT");
      expect(step1.valid).toBe(true);

      // Ao clicar em REINICIAR EXERCÍCIO: recria do MESMO vetor
      const restartedState = createInsertionSortState(initialArray);
      expect(restartedState.initialValues).toEqual(initialArray);
      expect(restartedState.errors).toBe(0);
      expect(restartedState.comparisons).toBe(0);
      expect(restartedState.shifts).toBe(0);
      expect(restartedState.insertions).toBe(0);
      expect(restartedState.i).toBe(1);
      expect(restartedState.key).toBe(20);
      expect(restartedState.holeIndex).toBe(1);
    });
  });

  describe("Dinâmica de Gameplay e Transições de Invariantes", () => {
    it("mantém a chave no trilho aéreo e a vaga na esteira durante COMPARE_AND_SHIFT", () => {
      const initial = [50, 20, 40, 10];
      const state = createInsertionSortState(initial);

      expect(state.phase).toBe("COMPARE_AND_SHIFT");
      expect(state.key).toBe(20);
      expect(state.holeIndex).toBe(1);
      expect(state.currentValues[1]).toBeNull();
      expect(state.orderedBoundary).toBe(0);
      expect(state.j).toBe(0);

      // Invariante de ORD: apenas índices <= orderedBoundary com valor != null são ORD
      // Neste momento: índice 0 tem 50 (ORD), índice 1 é vaga (NÃO É ORD)
      expect(state.currentValues[0]).toBe(50);
      expect(state.currentValues[state.holeIndex!]).toBeNull();
    });

    it("executa SHIFT com sucesso e atualiza scanner j e vaga", () => {
      const state = createInsertionSortState([50, 20, 40, 10]);
      // A[0] = 50 > key (20) -> SHIFT_RIGHT é o passo correto
      const res = executeInsertionStep(state, "SHIFT_RIGHT");
      expect(res.valid).toBe(true);
      expect(res.state.shifts).toBe(1);
      expect(res.state.comparisons).toBe(1);
      expect(res.state.holeIndex).toBe(0);
      expect(res.state.currentValues[0]).toBeNull(); // Vaga migrou para 0
      expect(res.state.currentValues[1]).toBe(50); // 50 foi deslocado para a direita
      expect(res.state.j).toBe(-1);
      expect(res.state.phase).toBe("INSERT_READY"); // Cabeceira alcançada
    });

    it("executa INSERT em cabeceira alcançada (HEAD_REACHED) e aciona auto-lift para i=2", () => {
      const state = createInsertionSortState([50, 20, 40, 10]);
      const shiftRes = executeInsertionStep(state, "SHIFT_RIGHT");
      expect(shiftRes.state.phase).toBe("INSERT_READY");

      const insertRes = executeInsertionStep(shiftRes.state, "INSERT_KEY");
      expect(insertRes.valid).toBe(true);
      expect(insertRes.state.insertions).toBe(1);

      // Auto-lift ativou a chave de i=2 (valor 40)
      expect(insertRes.state.i).toBe(2);
      expect(insertRes.state.key).toBe(40);
      expect(insertRes.state.holeIndex).toBe(2);
      expect(insertRes.state.orderedBoundary).toBe(1);
      expect(insertRes.state.currentValues[0]).toBe(20);
      expect(insertRes.state.currentValues[1]).toBe(50);
      expect(insertRes.state.currentValues[2]).toBeNull();
    });

    it("executa INSERT quando condição de deslocamento é falsa (CONDITION_FALSE)", () => {
      // Vetor onde i=1 tem 40 e A[0] tem 20 -> 20 <= 40, não desloca
      const state = createInsertionSortState([20, 40, 10, 30]);
      // A[0] = 20 <= 40 -> condição A[j] > key é falsa
      const res = executeInsertionStep(state, "INSERT_KEY");
      expect(res.valid).toBe(true);
      expect(res.state.insertions).toBe(1);
      expect(res.state.comparisons).toBe(1);
      // Chave 40 encaixada na vaga 1
      expect(res.state.currentValues[1]).toBe(40);
      expect(res.state.orderedBoundary).toBe(1);
    });

    it("detecta erro pedagógico e penaliza errors sem corromper estado", () => {
      const state = createInsertionSortState([50, 20, 40, 10]);
      // A[0] = 50 > 20, tentar ENCAIXAR é um erro pedagógico
      const res = executeInsertionStep(state, "INSERT_KEY");
      expect(res.valid).toBe(false);
      expect(res.isPedagogicalError).toBe(true);
      expect(res.state.errors).toBe(1);
      expect(res.state.key).toBe(20); // Chave preservada no trilho
      expect(res.state.holeIndex).toBe(1); // Vaga intacta

      const feedback = getInsertionStepFeedback(res, state, "INSERT_KEY");
      expect(feedback).toContain("MAIOR que a chave");
    });
  });

  describe("Dicas Contextuais, Pontuação e Progresso", () => {
    it("gera dicas contextuais sem avançar o estado da engine", () => {
      const state = createInsertionSortState([50, 20, 40, 10]);
      const hint = getInsertionContextualHint(state);
      expect(hint).toContain("A[0] (50) > CHAVE (20)");
      expect(hint).toContain("abrir espaço");

      // Engine inalterada
      expect(state.comparisons).toBe(0);
      expect(state.shifts).toBe(0);
    });

    it("calcula pontuação do protocolo respeitando a fórmula max(0, 100 - errors*10 - hints*5)", () => {
      expect(calculateProtocolScore({ errors: 0, hintsUsed: 0 })).toBe(100);
      expect(calculateProtocolScore({ errors: 1, hintsUsed: 0 })).toBe(90);
      expect(calculateProtocolScore({ errors: 0, hintsUsed: 2 })).toBe(90);
      expect(calculateProtocolScore({ errors: 2, hintsUsed: 3 })).toBe(65);
      expect(calculateProtocolScore({ errors: 12, hintsUsed: 0 })).toBe(0);
    });

    it("mede o progresso do exercício via calculateInsertionSortProgress de 0 a 100%", () => {
      const state = createInsertionSortState([30, 20, 10]);
      const p0 = calculateInsertionSortProgress(state);
      expect(p0).toBeGreaterThanOrEqual(0);

      // Passo 1: shift
      const s1 = executeInsertionStep(state, "SHIFT_RIGHT").state;
      // Passo 2: insert
      const s2 = executeInsertionStep(s1, "INSERT_KEY").state;
      const p1 = calculateInsertionSortProgress(s2);
      expect(p1).toBeGreaterThan(p0);

      // Passo 3: shift
      const s3 = executeInsertionStep(s2, "SHIFT_RIGHT").state;
      // Passo 4: shift
      const s4 = executeInsertionStep(s3, "SHIFT_RIGHT").state;
      // Passo 5: insert
      const s5 = executeInsertionStep(s4, "INSERT_KEY").state;
      expect(s5.completed).toBe(true);
      expect(calculateInsertionSortProgress(s5)).toBe(100);
    });
  });
});
