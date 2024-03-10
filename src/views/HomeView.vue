<script setup lang="ts">
import { ref } from 'vue'

interface GranskasInflection {
  word: string
  tag: string
}

interface GranskasInterpretation {
  tag: string
  inflections: GranskasInflection[]
}

type GranskasResponse = Array<{
  word: string
  interpretations: GranskasInterpretation[]
}>

const URL_INFLECT_VERB = 'https://skrutten.nada.kth.se/granskaapi/inflect/json'

const verb = ref<string | undefined>()
const result = ref<GranskasResponse[number] | undefined>()
const error = ref<string | undefined>()

async function onSubmit(): Promise<void> {
  if (verb.value == null) return
  await onSubmitVerb(verb.value)
}

async function postVerb(verb: string): Promise<GranskasResponse> {
  const url = `${URL_INFLECT_VERB}/${verb}`
  const response = await fetch(url)
  const result = await response.json()
  return result
}

async function onSubmitVerb(verb: string): Promise<void> {
  try {
    const json = await postVerb(verb)
    result.value = json[0]
    error.value = undefined
  } catch (err) {
    result.value = undefined
    error.value = 'Något gick fel'
    if (err instanceof Error && err.message) {
      error.value = err.message
    }
  }
}
</script>

<template>
  <main class="stack">
    <h1>Böj verb</h1>

    <form
      class="form"
      @submit.prevent="onSubmit"
    >
      <div class="stack">
        <label for="verb-input">Verb</label>
        <div>
          <input
            id="verb-input"
            v-model="verb"
            type="text"
          />
        </div>
      </div>

      <input
        type="submit"
        value="Sök"
      />
    </form>

    <div
      v-if="result"
      class="code"
    >
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>

    <p
      v-if="error"
      class="error"
    >
      {{ error }}
    </p>
  </main>
</template>

<style scoped>
.form {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.code {
  padding: 0.5rem;
  background: #f0f0f0;
}

.error {
  color: #f00;
}
</style>
