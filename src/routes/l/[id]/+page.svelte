<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    export let data: PageData;

    let isEditMode = false;
    let editToken = '';

    onMount(() => {
        const storedTokensStr = localStorage.getItem('cartshare_tokens') || '{}';
        const tokens = JSON.parse(storedTokensStr);
        if (tokens[data.list.id]) {
            isEditMode = true;
            editToken = tokens[data.list.id];
        }
    });

    function copyMarkdown() {
        const md = data.items.map(item => `- [${item.title}](${item.url}) - ￥${item.price || '未入力'}`).join('\n');
        navigator.clipboard.writeText(md);
        alert('Markdownをコピーしました');
    }

    function copyText() {
        const text = data.items.map(item => `${item.title}\n${item.url}\n￥${item.price || '未入力'}`).join('\n\n');
        navigator.clipboard.writeText(text);
        alert('テキストをコピーしました');
    }
</script>

<div class="w-full bg-secondary-container py-3 border-b border-outline-variant mb-stack-lg">
    <div class="max-w-container-max mx-auto px-gutter-desktop flex justify-center items-center gap-2">
        {#if isEditMode}
            <span class="material-symbols-outlined text-[16px] text-on-secondary-container">edit</span>
            <p class="text-body-md font-body-md text-on-secondary-container">
                あなたはこのリストを編集できます。
            </p>
        {:else}
            <span class="material-symbols-outlined text-[16px] text-on-secondary-container">visibility</span>
            <p class="text-body-md font-body-md text-on-secondary-container">
                このリストはあなたに共有されました。
                <a href="/" class="font-semibold underline ml-1 hover:text-primary">自分でリストを作成する</a>
            </p>
        {/if}
    </div>
</div>

<header class="mb-stack-lg flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-surface-variant pb-6 w-full">
    <div>
        <h1 class="text-headline-lg font-headline-lg text-on-surface">共有リスト</h1>
        <p class="text-body-md font-body-md text-on-surface-variant mt-2">{data.items.length}点の商品</p>
    </div>
    <div class="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant">
        <span class="material-symbols-outlined text-[18px] text-secondary">info</span>
        <span class="text-label-md font-label-md text-secondary">{isEditMode ? '編集可能' : '閲覧専用モード'}</span>
    </div>
</header>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-desktop w-full">
    {#each data.items as item}
        <article class="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:border-primary transition-all duration-200 group">
            <div class="aspect-square bg-surface-container flex items-center justify-center p-6 relative">
                <div class="absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur-sm px-2 py-1 rounded text-label-md font-label-md text-on-surface">
                    {new URL(item.url).hostname.replace('www.', '')}
                </div>
                {#if item.image_url}
                    <img src={`/api/proxy-image?url=${encodeURIComponent(item.image_url)}`} alt={item.title} class="object-contain w-full h-full mix-blend-screen group-hover:scale-105 transition-transform duration-300" />
                {:else}
                    <div class="w-full h-full flex items-center justify-center bg-surface-variant text-on-surface-variant">No Image</div>
                {/if}
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="text-headline-sm font-headline-sm text-on-surface line-clamp-2 mb-1" title={item.title}>{item.title}</h3>
                <div class="mt-auto flex justify-between items-center pt-4 border-t border-surface-variant">
                    <span class="text-body-lg font-body-lg font-bold text-on-surface">￥{item.price || '0'}</span>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" class="bg-surface-container-lowest border border-outline-variant text-on-surface px-4 py-2 rounded text-label-md font-label-md hover:border-primary hover:text-primary transition-colors flex items-center gap-1">
                        商品を見る
                        <span class="material-symbols-outlined text-[16px]">open_in_new</span>
                    </a>
                </div>
            </div>
        </article>
    {/each}
</div>

{#if data.items.length > 0}
<div class="w-full mt-8 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex justify-between items-center">
    <div class="flex gap-4">
        <button on:click={copyMarkdown} class="text-label-md font-label-md text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded hover:bg-surface-container transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">content_copy</span>
            MDコピー
        </button>
        <button on:click={copyText} class="text-label-md font-label-md text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded hover:bg-surface-container transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">content_copy</span>
            テキストコピー
        </button>
    </div>
    <div class="text-headline-sm font-headline-sm text-on-surface font-bold">
        合計金額: ￥{data.items.reduce((acc, item) => acc + (parseFloat((item.price || '0').replace(/,/g, '')) || 0), 0).toLocaleString()}
    </div>
</div>
{/if}
