<script lang="ts">
  interface Props {
    type?: 'text' | 'number' | 'url' | 'email' | 'password';
    value?: string | number;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    error?: string;
    min?: number;
    max?: number;
    class?: string;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
  }

  let {
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    disabled = false,
    required = false,
    label = '',
    error = '',
    min,
    max,
    class: className = '',
    oninput,
    onchange,
  }: Props = $props();

  const baseClasses =
    'block w-full rounded-lg border bg-white/50 dark:bg-gray-800/50 px-3 py-2 text-sm transition-smooth disabled:bg-gray-100/50 disabled:cursor-not-allowed dark:text-gray-100';
  
  const stateClasses = $derived(
    error 
      ? 'border-red-300 dark:border-red-500/50 focus:border-red-500' 
      : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
  );

  const classes = $derived(`${baseClasses} ${stateClasses} ${className}`);
</script>

{#if label}
  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
    {label}
    {#if required}<span class="text-red-500 ml-0.5">*</span>{/if}
  </label>
{/if}

<input
  {type}
  bind:value
  {placeholder}
  {disabled}
  {required}
  {min}
  {max}
  class={classes}
  oninput={oninput}
  onchange={onchange}
/>

{#if error}
  <p class="mt-1 text-xs text-red-500">{error}</p>
{/if}
