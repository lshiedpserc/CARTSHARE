<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<!-- TopNavBar -->
<header class="bg-surface-container-lowest w-full h-16 border-b border-outline-variant flex-none">
    <div class="max-w-container-max mx-auto px-gutter-desktop flex justify-between items-center w-full h-full">
        <div class="flex items-center gap-gutter-desktop">
            <a href="/" class="text-headline-md font-headline-md font-bold text-primary flex items-center gap-2">
                <span class="material-symbols-outlined">shopping_cart</span>
                Cartshare
            </a>
        </div>
    </div>
</header>

<main class="flex-grow flex flex-col items-center justify-start pt-stack-xl pb-stack-xl px-gutter-mobile md:px-0">
    {@render children()}
</main>

<footer class="bg-surface-container w-full py-stack-xl mt-auto">
    <div class="max-w-container-max mx-auto px-gutter-desktop grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        <div>
            <span class="text-label-md font-label-md font-semibold text-secondary">Cartshare</span>
            <p class="text-body-md font-body-md text-on-surface-variant mt-2">© 2024 Cartshare. ログイン不要の編集はブラウザのクッキーにより有効です。</p>
        </div>
    </div>
</footer>
