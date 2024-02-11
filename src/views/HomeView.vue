<script setup lang="ts">
import { ref } from 'vue'

const URL_INFLECT_VERB = 'https://skrutten.nada.kth.se/granskaapi/inflect/json/vb'

const verb = ref<string | undefined>()
const result = ref<string | undefined>()
const error = ref<string | undefined>()

async function onSubmit(): Promise<void> {
  console.log('submit', verb.value)
  if (verb.value == null) return
  await postVerb(verb.value)
}

async function postVerb(verb: string): Promise<void> {
  const url = `${URL_INFLECT_VERB}/${verb}`
  try {
    const response = await fetch(url)
    const json = await response.json()
    console.log(json)
    const inflections = json[0].interpretations[0].inflections
    console.log(inflections)
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
            v-model="verb"
            id="verb-input"
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
  color: #ff0000;
}
</style>
