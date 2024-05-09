<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'

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

const inputVerbModel = ref<string | undefined>()
const activeVerb = ref<string | undefined>()

const {
  data: granskaResponse,
  error,
  isLoading,
} = useQuery({
  queryKey: [activeVerb],
  queryFn: async () => {
    if (activeVerb.value == null) return null
    return await postVerb(activeVerb.value)
  },
})
const result = computed(() => {
  if (granskaResponse.value == null) return null
  return extractInflections(granskaResponse.value)
})

async function onSubmit(): Promise<void> {
  if (inputVerbModel.value == null) return
  activeVerb.value = inputVerbModel.value
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
  const [dotSeparated, maybeAsterix] = tag.split(' ') as [GranskasVerbTag, GranskasMaybeTagAsterix]
  const [, tempus, modus] = dotSeparated.split('.') as ['vb', GranskasTempus, GranskasModus]
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
            v-model="inputVerbModel"
            type="text"
          />
        </div>
      </div>

      <input
        type="submit"
        value="Sök"
      />
    </form>

    <p v-if="isLoading">loading...</p>

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
      {{ error.name }}
      {{ error.message }}
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
