<script setup lang="ts">
import { ref } from 'vue'

type GranskasTempus = 'imp' | 'inf' | 'prs' | 'prt' | 'sup'

type GranskasModus = 'akt' | 'sfo'

type GranskasVerbTag = `vb.${GranskasTempus}.${GranskasModus}`

type GranskasMaybeTagAsterix = '' | ' *'

type GranskasVerbTagFull = `${GranskasVerbTag}${GranskasMaybeTagAsterix}`

interface GranskasInflection {
  word: string
  tag: string
}

interface GranskasVerbInflection extends GranskasInflection {
  tag: GranskasVerbTag
}

interface GranskasInterpretation {
  tag: string
  inflections: Array<GranskasVerbInflection | GranskasInflection>
}

type GranskasResponse = Array<{
  word: string
  interpretations: GranskasInterpretation[]
}>

interface Inflection {
  word: string
}

interface ActiveAndPassive {
  active?: Inflection
  passive?: Inflection
}

interface Inflections {
  imperative?: ActiveAndPassive
  infinitive?: ActiveAndPassive
  present?: ActiveAndPassive
  preterite?: ActiveAndPassive
  supine?: ActiveAndPassive
}

const URL_INFLECT_VERB = 'https://skrutten.nada.kth.se/granskaapi/inflect/json'
const TEMPI_MAP: Record<GranskasTempus, keyof Inflections> = {
  imp: 'imperative',
  inf: 'infinitive',
  prs: 'present',
  prt: 'preterite',
  sup: 'supine',
}
const MODI_MAP: Record<GranskasModus, keyof ActiveAndPassive> = {
  akt: 'active',
  sfo: 'passive',
}

const verb = ref<string | undefined>()
const result = ref<Inflections | undefined>()
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

function isVerb(
  granskaInflection: GranskasInflection
): granskaInflection is GranskasVerbInflection {
  return granskaInflection.tag.startsWith('vb.')
}

function extract(tag: GranskasVerbTagFull): {
  tempus: GranskasTempus
  modus: GranskasModus
  asterix: boolean
} {
  const [x, maybeAsterix] = tag.split(' ') as [GranskasVerbTag, GranskasMaybeTagAsterix]
  const [, tempus, modus] = x.split('.') as ['vb', GranskasTempus, GranskasModus]
  return { tempus, modus, asterix: !!maybeAsterix }
}

function extractInflections(granskaResponse: GranskasResponse): Inflections {
  const flattenedVerbs = granskaResponse[0].interpretations
    .flatMap((interpretation) => interpretation.inflections)
    .filter(isVerb)
  const startVal: Inflections = {}
  return flattenedVerbs.reduce((result, current) => {
    const { tempus, modus } = extract(current.tag)
    const tempusKey = TEMPI_MAP[tempus]
    const modusKey = MODI_MAP[modus ?? 'akt']
    if (result[tempusKey] == null) result[tempusKey] = {}
    const valObj = { [modusKey]: current.word }
    result[tempusKey] = { ...result[tempusKey], ...valObj }
    return result
  }, startVal)
}

async function onSubmitVerb(verb: string): Promise<void> {
  try {
    const granskaResponse = await postVerb(verb)
    result.value = extractInflections(granskaResponse)
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
