export function initEvaluation() {

  const container =
    document.getElementById(
      "evaluation-container"
    );

  if (!container) {
    return;
  }

  let evaluation = null;
  let currentQuestion = 0;
  let score = 0;

  loadEvaluation();

  // ==========================================
  // CARGAR EVALUACIÓN
  // ==========================================

  async function loadEvaluation() {

    try {

      const response =
        await fetch(
          "http://localhost:3000/api/evaluation",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({})
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "No se pudo generar la evaluación."
        );

      }

      evaluation = data;

      renderQuestion();

    } catch (error) {

      console.error(
        "Error al cargar evaluación:",
        error
      );

      container.innerHTML = `
        <div class="evaluation-error">

          <p>
            Ups 💗 No pude preparar la evaluación
            en este momento.
          </p>

          <button
            id="retry-evaluation"
            class="btn btn-primary"
          >
            Intentar nuevamente
          </button>

        </div>
      `;

      document
        .getElementById(
          "retry-evaluation"
        )
        .addEventListener(
          "click",
          loadEvaluation
        );
    }
  }

  // ==========================================
  // MOSTRAR PREGUNTA
  // ==========================================

  function renderQuestion() {

    const question =
      evaluation.questions[currentQuestion];

    const questionNumber =
      currentQuestion + 1;

    const totalQuestions =
      evaluation.questions.length;

    const progress =
      (questionNumber / totalQuestions) * 100;

    container.innerHTML = `
      <div class="evaluation-card">

        <div class="evaluation-progress">

          <span>
            Pregunta ${questionNumber}
            de ${totalQuestions}
          </span>

          <div class="evaluation-progress-bar">

            <div
              class="evaluation-progress-fill"
              style="width: ${progress}%"
            ></div>

          </div>

        </div>

        <span class="evaluation-topic">
          ${question.topic}
        </span>

        <h2 class="evaluation-question">
          ${question.question}
        </h2>

        <input
          id="evaluation-answer"
          class="evaluation-answer"
          type="text"
          placeholder="Escribe tu respuesta..."
          autocomplete="off"
        />

        <div class="evaluation-actions">

          <button
            id="check-answer"
            class="btn btn-primary"
          >
            Comprobar ✓
          </button>

        </div>

        <div id="evaluation-feedback"></div>

      </div>
    `;

    const answerInput =
      document.getElementById(
        "evaluation-answer"
      );

    const checkButton =
      document.getElementById(
        "check-answer"
      );

    answerInput.focus();

    let answered = false;

    // ==========================================
    // BOTÓN COMPROBAR / SIGUIENTE
    // ==========================================

    checkButton.addEventListener(
      "click",
      async () => {

        if (!answered) {

          const answerWasChecked =
            await checkAnswer(
              answerInput.value
            );

          if (!answerWasChecked) {
            return;
          }

          answered = true;

          answerInput.disabled = true;

          checkButton.textContent =
            currentQuestion ===
            evaluation.questions.length - 1
              ? "Terminar evaluación"
              : "Siguiente →";

          return;
        }

        if (
          currentQuestion ===
          evaluation.questions.length - 1
        ) {

          await showResults();

        } else {

          currentQuestion++;

          renderQuestion();

        }
      }
    );

    // ==========================================
    // RESPONDER CON ENTER
    // ==========================================

    answerInput.addEventListener(
      "keydown",
      async (event) => {

        if (event.key !== "Enter") {
          return;
        }

        event.preventDefault();

        if (!answered) {

          const answerWasChecked =
            await checkAnswer(
              answerInput.value
            );

          if (!answerWasChecked) {
            return;
          }

          answered = true;

          answerInput.disabled = true;

          checkButton.textContent =
            currentQuestion ===
            evaluation.questions.length - 1
              ? "Terminar evaluación"
              : "Siguiente →";

          return;
        }

        if (
          currentQuestion ===
          evaluation.questions.length - 1
        ) {

          await showResults();

        } else {

          currentQuestion++;

          renderQuestion();

        }

      }
    );
  }

  // ==========================================
  // COMPROBAR RESPUESTA
  // ==========================================

  async function checkAnswer(studentAnswer) {

    const answer =
      studentAnswer.trim();

    if (!answer) {
      return false;
    }

    const question =
      evaluation.questions[currentQuestion];

    try {

      const response =
        await fetch(
          "http://localhost:3000/api/evaluation/answer",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              evaluationId: evaluation.id,
              questionNumber: question.number,
              answer: answer
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "No se pudo comprobar la respuesta."
        );

      }

      const feedback =
        document.getElementById(
          "evaluation-feedback"
        );

      feedback.innerHTML = `
        <div class="evaluation-feedback ${
          data.correct
            ? "correct"
            : "incorrect"
        }">

          ${data.feedback}

        </div>
      `;

      if (data.correct) {
        score++;
      }

      return true;

    } catch (error) {

      console.error(
        "Error al comprobar respuesta:",
        error
      );

      const feedback =
        document.getElementById(
          "evaluation-feedback"
        );

      feedback.innerHTML = `
        <div class="evaluation-feedback incorrect">

          Ups 💗 No pude comprobar tu respuesta.

          Inténtalo nuevamente.

        </div>
      `;

      return false;
    }
  }

  // ==========================================
  // OBTENER DIAGNÓSTICO
  // ==========================================

  async function showResults() {

    try {

      const response =
        await fetch(
          "http://localhost:3000/api/evaluation/finish",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              evaluationId: evaluation.id
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "No se pudo obtener el diagnóstico."
        );

      }

      // ========================================
      // RESULTADO POR TEMA
      // ========================================

      const topicsHTML =
        data.topics
          .map(
            (topic) => `
              <div class="diagnostic-item">

                <strong>
                  ${topic.topic}
                </strong>

                <span>
                  ${topic.correct}/${topic.total}
                  (${topic.percentage}%)
                </span>

                <small>
                  ${topic.level}
                </small>

              </div>
            `
          )
          .join("");

      // ========================================
      // RESULTADO POR SUBTEMA
      // ========================================

      const subtopicsHTML =
        data.subtopics
          .map(
            (subtopic) => `
              <div class="diagnostic-item">

                <strong>
                  ${subtopic.subtopic}
                </strong>

                <span>
                  ${subtopic.correct}/${subtopic.total}
                  (${subtopic.percentage}%)
                </span>

                <small>
                  ${subtopic.level}
                </small>

              </div>
            `
          )
          .join("");

      // ========================================
      // CREAR OPCIONES DE PRÁCTICA
      // ========================================

      let practiceItems = [];

      // ----------------------------------------
      // 1. SUBTEMAS CON SUFICIENTE EVIDENCIA
      // ----------------------------------------

      if (
        Array.isArray(data.subtopicWeaknesses) &&
        data.subtopicWeaknesses.length > 0
      ) {

        data.subtopicWeaknesses.forEach(
          (item) => {

            practiceItems.push({
              type: "subtopic",
              name: item.subtopic,
              label: item.subtopic
            });

          }
        );
      }

      // ----------------------------------------
      // 2. TEMAS CON ÁREA DE OPORTUNIDAD
      //    PERO SIN SUBTEMA IDENTIFICADO
      // ----------------------------------------

      if (
        practiceItems.length === 0 &&
        Array.isArray(data.weaknesses) &&
        data.weaknesses.length > 0
      ) {

        data.weaknesses.forEach(
          (item) => {

            practiceItems.push({
              type: "topic",
              name: item.topic,
              label: item.topic
            });

          }
        );
      }

      // ========================================
      // HTML DE OPCIONES DE PRÁCTICA
      // ========================================

      const practiceHTML =
        practiceItems.length > 0

          ? practiceItems
              .map(
                (item) => `
                  <li class="practice-item">

                    <div class="practice-item-content">

                      <span>
                        ${item.label}
                      </span>

                      <button
                        type="button"
                        class="btn btn-primary practice-button"
                        data-practice-type="${item.type}"
                        data-practice-name="${item.name}"
                      >
                        💗 Practicar
                      </button>

                    </div>

                  </li>
                `
              )
              .join("")

          : `
              <li>
                Por ahora no hay áreas de
                oportunidad detectadas.
              </li>
            `;

      // ========================================
      // MOSTRAR DIAGNÓSTICO
      // ========================================

      container.innerHTML = `
        <div class="evaluation-finish">

          <h2>
            🎉 ¡Terminaste!
          </h2>

          <p>
            Completaste tu práctica de
            <strong>
              ${data.subject}
            </strong>.
          </p>

          <div class="evaluation-score">
            ${data.score} / ${data.totalQuestions}
          </div>

          <h3>
            📊 Resultado por tema
          </h3>

          <div class="diagnostic-list">
            ${topicsHTML}
          </div>

          <h3>
            🔎 Resultado por subtema
          </h3>

          <div class="diagnostic-list">
            ${subtopicsHTML}
          </div>

          <h3>
            💗 Podemos practicar
          </h3>

          <ul class="diagnostic-weaknesses">
            ${practiceHTML}
          </ul>

        </div>
      `;

      // ========================================
      // EVENTOS DE BOTONES DE PRÁCTICA
      // ========================================

      const practiceButtons =
        document.querySelectorAll(
          ".practice-button"
        );

      practiceButtons.forEach(
        (button) => {

          button.addEventListener(
            "click",
            async () => {

              const type =
                button.dataset.practiceType;

              const name =
                button.dataset.practiceName;

              console.log(
                "Práctica seleccionada:",
                {
                  type,
                  name
                }
              );

              await startPractice(
                type,
                name
              );

            }
          );

        }
      );

    } catch (error) {

      console.error(
        "Error al obtener diagnóstico:",
        error
      );

      const totalQuestions =
        evaluation.questions.length;

      container.innerHTML = `
        <div class="evaluation-error">

          <p>
            Terminaste tu evaluación, pero no pude
            obtener el diagnóstico. 💗
          </p>

          <p>
            Resultado:
            <strong>
              ${score} / ${totalQuestions}
            </strong>
          </p>

        </div>
      `;
    }
  }

  // ========================================
  // INICIAR PRÁCTICA
  // ========================================

  async function startPractice(
    type,
    name
  ) {

    // ======================================
    // MOSTRAR CARGANDO
    // ======================================

    container.innerHTML = `
      <div class="evaluation-loading">

        <h2>
          💗 Preparando tu práctica...
        </h2>

        <p>
          Vamos a trabajar juntas en:
          <strong>${name}</strong>
        </p>

      </div>
    `;

    try {

      // ====================================
      // MENSAJE INICIAL
      // ====================================

      const initialMessage =
        `
          Quiero practicar
          ${type === "subtopic"
            ? "el subtema"
            : "el tema"
          } "${name}".

          Ayúdame paso a paso y
          comienza con un ejercicio.
        `;

      // ====================================
      // LLAMAR A /api/practice
      // ====================================

      const response =
        await fetch(
          "http://localhost:3000/api/practice",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              subtopic: name,
              message: initialMessage,
              history: []
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "No se pudo iniciar la práctica."
        );

      }

      console.log(
        "Sesión de práctica creada:",
        data.sessionId
      );

      // ====================================
      // MOSTRAR PRÁCTICA
      // ====================================

      renderPractice(
        name,
        data.reply,
        [],
        data.sessionId
      );

    } catch (error) {

      console.error(
        "Error al iniciar práctica:",
        error
      );

      container.innerHTML = `
        <div class="evaluation-error">

          <p>
            Ups 💗 No pude iniciar la práctica
            en este momento.
          </p>

          <button
            id="back-to-results"
            class="btn btn-primary"
          >
            Volver al diagnóstico
          </button>

        </div>
      `;

      document
        .getElementById(
          "back-to-results"
        )
        .addEventListener(
          "click",
          showResults
        );
    }
  }

  // ========================================
  // MOSTRAR PRÁCTICA
  // ========================================

  function renderPractice(
    name,
    reply,
    history = [],
    sessionId = null
  ) {

    // ======================================
    // CREAR HISTORIAL INICIAL
    // ======================================

    if (history.length === 0) {

      history = [
        {
          role: "model",
          content: reply
        }
      ];

    }

    // ======================================
    // MOSTRAR INTERFAZ
    // ======================================

    container.innerHTML = `
      <div class="practice-card">

        <div class="practice-header">

          <span class="chat-badge">
            💗 Práctica
          </span>

          <h2>
            Practiquemos: ${name}
          </h2>

          <p>
            Vamos paso a paso. Tú puedes. ✨
          </p>

        </div>

        <div class="practice-message">

          <div class="practice-avatar">
            🐱
          </div>

          <div class="practice-content">

            <strong>
              Jadoo
            </strong>

            <p>
              ${reply}
            </p>

          </div>

        </div>

        <div class="practice-input-area">

          <input
            id="practice-input"
            type="text"
            placeholder="Escribe tu respuesta..."
            autocomplete="off"
          />

          <button
            id="practice-send"
            class="btn btn-primary"
          >
            Responder ➤
          </button>

        </div>

        <div id="practice-feedback"></div>

      </div>
    `;

    // ======================================
    // ELEMENTOS
    // ======================================

    const input =
      document.getElementById(
        "practice-input"
      );

    const sendButton =
      document.getElementById(
        "practice-send"
      );

    const feedback =
      document.getElementById(
        "practice-feedback"
      );

    input.focus();

    // ======================================
    // ENVIAR RESPUESTA
    // ======================================

    async function sendPracticeAnswer() {

      const answer =
        input.value.trim();

      // ------------------------------------
      // VALIDAR RESPUESTA
      // ------------------------------------

      if (!answer) {

        input.focus();

        return;
      }

      // ------------------------------------
      // DESACTIVAR CONTROLES
      // ------------------------------------

      input.disabled = true;

      sendButton.disabled = true;

      sendButton.textContent =
        "Jadoo está pensando... 💗";

      feedback.innerHTML = "";

      try {

        // ==================================
        // CREAR HISTORIAL ACTUALIZADO
        // ==================================

        const updatedHistory = [
          ...history,
          {
            role: "user",
            content: answer
          }
        ];

        // ==================================
        // LLAMAR A JADOO
        // ==================================

        const response =
          await fetch(
            "http://localhost:3000/api/practice",
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json"
              },

              body: JSON.stringify({
                subtopic: name,
                message: answer,
                history: updatedHistory,
                sessionId: sessionId
              })
            }
          );

        const data =
          await response.json();

        // ==================================
        // VALIDAR RESPUESTA
        // ==================================

        if (!response.ok) {

          throw new Error(
            data.error ||
            "No se pudo continuar la práctica."
          );

        }

        console.log(
          "Sesión de práctica:",
          data.sessionId
        );

        // ==================================
        // GUARDAR RESPUESTA DE JADOO
        // ==================================

        updatedHistory.push({
          role: "model",
          content: data.reply
        });

        // ==================================
        // MOSTRAR NUEVA RESPUESTA
        // ==================================

        renderPractice(
          name,
          data.reply,
          updatedHistory,
          data.sessionId || sessionId
        );

      } catch (error) {

        console.error(
          "Error en práctica:",
          error
        );

        // ==================================
        // MOSTRAR ERROR
        // ==================================

        feedback.innerHTML = `
          <div class="evaluation-feedback incorrect">

            Ups 💗 No pude continuar la práctica.

            Inténtalo nuevamente.

          </div>
        `;

        // ----------------------------------
        // REACTIVAR CONTROLES
        // ----------------------------------

        input.disabled = false;

        sendButton.disabled = false;

        sendButton.textContent =
          "Responder ➤";

        input.focus();
      }
    }

    // ======================================
    // BOTÓN RESPONDER
    // ======================================

    sendButton.addEventListener(
      "click",
      sendPracticeAnswer
    );

    // ======================================
    // RESPONDER CON ENTER
    // ======================================

    input.addEventListener(
      "keydown",
      (event) => {

        if (event.key !== "Enter") {
          return;
        }

        event.preventDefault();

        sendPracticeAnswer();

      }
    );
  }

}