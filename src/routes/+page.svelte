<script lang="ts">
    import { onMount } from 'svelte';

    type Item = {
        id: string;
        title: string;
        url: string;
        domain: string;
        price: string;
        imageUrl: string;
    };

    let items = $state<Item[]>([]);
    let newUrl = $state('');
    let isLoading = $state(false);
    let isSaving = $state(false);
    let shareUrl = $state('');

    async function handleAddUrl(e: Event) {
        e.preventDefault();
        if (!newUrl) return;
        isLoading = true;
        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: newUrl })
            });
            const data = await res.json();

            if (res.ok) {
                items.push({
                    id: Math.random().toString(36).substring(7),
                    title: data.title,
                    url: newUrl,
                    domain: data.domain,
                    price: '',
                    imageUrl: data.imageUrl
                });
                newUrl = '';
            } else {
                alert('URLの取得に失敗しました');
            }
        } catch (e) {
            console.error(e);
            alert('エラーが発生しました');
        } finally {
            isLoading = false;
        }
    }

    function removeItem(id: string) {
        items = items.filter(item => item.id !== id);
    }

    async function saveList() {
        if (items.length === 0) return;
        isSaving = true;

        try {
            const res = await fetch('/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });

            if (res.ok) {
                const data = await res.json();

                // トークンをlocalStorageに保存
                const stored = localStorage.getItem('cartshare_tokens') || '{}';
                const tokens = JSON.parse(stored);
                tokens[data.listId] = data.editToken;
                localStorage.setItem('cartshare_tokens', JSON.stringify(tokens));

                shareUrl = `${window.location.origin}/l/${data.listId}`;

            } else {
                alert('保存に失敗しました');
            }
        } catch (e) {
            alert('エラーが発生しました');
        } finally {
            isSaving = false;
        }
    }

    function copyMarkdown() {
        const md = items.map(item => `- [${item.title}](${item.url}) - ￥${item.price || '未入力'}`).join('\n');
        navigator.clipboard.writeText(md);
        alert('Markdownをコピーしました');
    }

    function copyText() {
        const text = items.map(item => `${item.title}\n${item.url}\n￥${item.price || '未入力'}`).join('\n\n');
        navigator.clipboard.writeText(text);
        alert('テキストをコピーしました');
    }
</script>

{#if shareUrl}
    <!-- Modal Overlay Container -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-gutter-mobile md:p-gutter-desktop bg-surface-dim/80 backdrop-blur-sm">
        <div class="bg-surface-container-lowest w-full max-w-[520px] rounded-xl border border-outline-variant shadow-lg relative flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <button onclick={() => shareUrl = ''} aria-label="Close" class="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors duration-200">
                <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
            <div class="p-stack-lg flex flex-col gap-stack-lg">
                <div class="flex flex-col items-center text-center gap-stack-md mt-stack-sm">
                    <div class="w-16 h-16 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                        <span class="material-symbols-outlined text-[32px]">check_circle</span>
                    </div>
                    <h2 class="font-headline-md text-headline-md text-on-surface">リストが作成されました！</h2>
                    <p class="font-body-md text-body-md text-on-surface-variant max-w-sm">
                        共有用カートの準備ができました。このリンクを共有して、他の人が閲覧できるようにしましょう。
                    </p>
                </div>
                <div class="flex flex-col gap-stack-sm">
                    <div class="flex items-center justify-between bg-surface-bright border border-outline-variant rounded-lg p-1">
                        <div class="flex-grow pl-3 pr-2 py-2 overflow-hidden">
                            <span class="font-body-md text-body-md text-on-surface whitespace-nowrap block truncate select-all">
                                {shareUrl}
                            </span>
                        </div>
                        <button onclick={() => navigator.clipboard.writeText(shareUrl)} class="bg-primary text-on-primary font-label-md text-label-md px-4 py-2.5 rounded-[0.2rem] hover:bg-primary/90 transition-colors flex items-center gap-2 flex-shrink-0">
                            <span class="material-symbols-outlined text-[16px]">content_copy</span>
                            リンクをコピー
                        </button>
                    </div>
                </div>

                <hr class="border-t border-outline-variant/50 w-full"/>
                <div class="bg-surface-container-low rounded-lg p-stack-md border border-outline-variant flex gap-stack-md items-start">
                    <span class="material-symbols-outlined text-secondary mt-0.5 text-[20px]">info</span>
                    <div class="flex flex-col gap-1">
                        <h3 class="font-label-md text-label-md text-on-surface">編集方法について</h3>
                        <p class="font-body-md text-body-md text-on-surface-variant text-[13px] leading-relaxed">
                            ログイン不要で利用できるよう、このブラウザに編集用トークンを保存しました。このブラウザを使用している限り、いつでも戻ってリストを変更できます。
                        </p>
                    </div>
                </div>
                <a href={shareUrl} class="w-full py-3 bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container transition-colors rounded-lg font-label-md text-label-md mt-2 flex justify-center items-center gap-2">
                    共有リストを見る
                </a>
            </div>
        </div>
    </div>
{/if}

<div class="w-full flex justify-end mb-4 w-full max-w-3xl">
    <button onclick={saveList} disabled={items.length === 0 || isSaving} class="flex items-center gap-2 bg-primary-container text-on-primary-container hover:bg-primary-container/90 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 text-label-md font-label-md font-semibold disabled:opacity-50">
        <span class="material-symbols-outlined text-[18px]">share</span>
        {isSaving ? '保存中...' : '保存して共有'}
    </button>
</div>

<div class="w-full max-w-3xl mb-stack-xl">
    <div class="text-center mb-stack-md">
        <h1 class="text-headline-lg font-headline-lg text-on-surface mb-2">リストを作成する</h1>
        <p class="text-body-lg font-body-lg text-on-surface-variant">どこからでもURLを貼り付けて、シェア可能な1つのリストにまとめましょう。</p>
    </div>

    <form onsubmit={handleAddUrl} class="relative flex items-center w-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all overflow-hidden group">
        <span class="material-symbols-outlined text-outline ml-4 group-focus-within:text-primary transition-colors">link</span>
        <input
            type="url"
            bind:value={newUrl}
            disabled={isLoading}
            class="w-full bg-transparent border-none outline-none py-4 px-4 text-body-lg font-body-lg text-on-surface placeholder:text-outline-variant focus:ring-0 disabled:opacity-50"
            placeholder="商品のURLを貼り付け (Amazon, AliExpressなど)"
            required
        />
        <div class="absolute right-2 top-1/2 -translate-y-1/2">
            <button type="submit" disabled={isLoading} class="bg-primary-container text-on-primary-container hover:bg-primary-container/90 px-6 py-2.5 rounded-lg text-label-md font-label-md font-semibold shadow-sm transition-colors whitespace-nowrap flex items-center gap-2 disabled:opacity-50">
                {isLoading ? '取得中...' : 'リストに追加'}
            </button>
        </div>
    </form>
</div>

<div class="w-full max-w-3xl flex flex-col gap-stack-md">
    {#each items as item (item.id)}
        <div class="group flex items-center bg-surface-container-lowest border border-outline-variant rounded-xl p-3 shadow-sm hover:shadow-md hover:border-primary transition-all duration-200 gap-4">
            <button class="text-outline-variant hover:text-on-surface cursor-grab active:cursor-grabbing p-1 transition-colors">
                <span class="material-symbols-outlined">drag_indicator</span>
            </button>
            <div class="w-24 h-24 bg-surface-container-low rounded-lg border border-outline-variant overflow-hidden flex-none relative">
                {#if item.imageUrl}
                    <img src={`/api/proxy-image?url=${encodeURIComponent(item.imageUrl)}`} alt={item.title} class="w-full h-full object-cover" />
                {:else}
                     <div class="w-full h-full flex items-center justify-center bg-surface-variant text-on-surface-variant">No Image</div>
                {/if}
            </div>
            <div class="flex-grow flex flex-col justify-center gap-1 overflow-hidden">
                <div class="flex items-center gap-2">
                    <input type="text" bind:value={item.title} class="text-headline-sm font-headline-sm text-on-surface bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary outline-none focus:ring-0 w-full truncate" />
                </div>
                <div class="flex items-center gap-2 mt-1">
                    <span class="px-2 py-0.5 bg-surface-container-low text-on-surface-variant rounded text-label-md font-label-md border border-outline-variant max-w-[120px] truncate">{item.domain}</span>
                    <span class="text-body-md font-body-md font-semibold text-on-surface ml-auto">￥</span>
                    <input type="text" bind:value={item.price} class="text-body-md font-body-md font-semibold text-on-surface bg-transparent border-b border-outline-variant w-24 outline-none focus:border-primary px-1 text-right" placeholder="0" />
                </div>
            </div>
            <button onclick={() => removeItem(item.id)} class="text-outline-variant hover:text-error hover:bg-error-container p-2 rounded-full transition-colors self-start opacity-0 group-hover:opacity-100 focus:opacity-100">
                <span class="material-symbols-outlined">delete</span>
            </button>
        </div>
    {/each}
</div>

{#if items.length > 0}
<div class="w-full max-w-3xl mt-6 flex justify-between items-center bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
    <div class="flex gap-4">
        <button onclick={copyMarkdown} class="text-label-md font-label-md text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded hover:bg-surface-container transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">content_copy</span>
            MDコピー
        </button>
        <button onclick={copyText} class="text-label-md font-label-md text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded hover:bg-surface-container transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">content_copy</span>
            テキストコピー
        </button>
    </div>
    <div class="text-headline-sm font-headline-sm text-on-surface font-bold">
        合計予想金額: ￥{items.reduce((acc, item) => acc + (parseFloat(item.price.replace(/,/g, '')) || 0), 0).toLocaleString()}
    </div>
</div>
{/if}
