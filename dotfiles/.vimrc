set nocompatible              " be iMproved, required
filetype off                  " required

if empty(glob('~/.vim/autoload/plug.vim'))
  silent !curl -fLo ~/.vim/autoload/plug.vim --create-dirs
    \ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
  autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
endif

call plug#begin('~/.vim/plugged')

Plug 'rakr/vim-one'
Plug 'dracula/vim'
Plug 'liuchengxu/space-vim-theme'
Plug 'skywind3000/asyncrun.vim'
Plug 'ctrlpvim/ctrlp.vim'
Plug 'itchyny/lightline.vim'
Plug 'derekwyatt/vim-scala'
Plug 'rust-lang/rust.vim'
Plug 'godlygeek/tabular'
Plug 'terryma/vim-multiple-cursors'
Plug 'tpope/vim-vinegar'
Plug 'tpope/vim-surround'
Plug 'elixir-lang/vim-elixir'
Plug 'kien/rainbow_parentheses.vim'
Plug 'bronson/vim-trailing-whitespace'
Plug 'editorconfig/editorconfig-vim'
Plug 'rking/ag.vim'
Plug 'tpope/vim-fugitive'
Plug 'keith/swift.vim'
Plug 'wakatime/vim-wakatime'
Plug 'jussi-kalliokoski/harmony.vim'
Plug 'rhysd/vim-crystal'
Plug 'nelstrom/vim-mac-classic-theme'
Plug 'altercation/vim-colors-solarized'
Plug 'slashmili/alchemist.vim'
Plug 'tpope/vim-commentary'
Plug 'dyng/ctrlsf.vim'
Plug 'sonph/onehalf', {'rtp': 'vim/'}

" All of your Plugins must be added before the following line
call plug#end()

filetype plugin indent on
" To ignore plugin indent changes, instead use:
"filetype plugin on

set bg=light
syntax on
set tabstop=2
set softtabstop=2
set expandtab
set shiftwidth=2
set linespace=2

if has("gui_running")
  set guifont=Hack:h15
  " macvim_skip_colorscheme
  colorscheme space_vim_theme
endif

set backspace=indent,eol,start
set colorcolumn=80,100,120
highlight ColorColumn ctermbg=lightred guibg=#efefef

set showcmd     "show incomplete cmds down the bottom
set showmode    "show current mode down the bottom

set incsearch   "find the next match as we type the search
set hlsearch    "hilight searches by default
set ignorecase
set smartcase

set number      "add line numbers
set relativenumber "relative line numbers
set showbreak=...
set nowrap

set path+=**
set wildmenu

set title "set terminal title

"disable visual bell
set visualbell t_vb=

" window navigation
map <C-h> <C-w>h
map <C-j> <C-w>j
map <C-k> <C-w>k
map <C-l> <C-w>l

set statusline+=%=      "left/right separator
set statusline+=%c,     "cursor column
set statusline+=%l/%L   "cursor line/total lines
set statusline+=\ %P    "percent through file
set laststatus=2

"turn off needless toolbar on gvim/mvim
set guioptions-=T

"make <c-l> clear the highlight as well as redraw
nnoremap <D-k> :nohls<CR><C-L>
inoremap <D-k> <C-O>:nohls<CR>

set wildignore+=*/tmp/*,*.so,*.swp,*.zip     " MacOSX/Linux
set wildignore+=*\\tmp\\*,*.swp,*.zip,*.exe  " Windows

set wildignore+=*.class


"
" Plugin settings
"

" ctrlp
let g:ctrlp_custom_ignore = {
  \ 'dir':  '\v[\/](\.(git|hg|svn)|target|deps|node_modules|_build)$',
  \ 'file': '\v\.(exe|so|dll|class)$',
  \ }

if executable("ag")
  set grepprg=ag\ --nogroup\ --nocolor
  let g:ctrlp_user_command = 'ag %s -l --nocolor -g ""'
  let g:ctrlp_use_caching = 0
endif

if executable("rg")
  set grepprg=rg\ --vimgrep\ --no-heading
  let g:ctrlp_user_command = 'rg %s --files --color=never --glob ""'
  let g:ctrlp_use_caching = 0
endif

let g:lightline = {
      \ 'component': {
      \   'readonly': '%{&readonly?"":""}',
      \ },
      \ 'component_function': {
      \   'fugitive': 'LightLineFugitive',
      \ },
      \ 'active': {
      \   'left': [ [ 'mode', 'paste' ],
      \             [ 'fugitive', 'readonly', 'filename', 'modified' ] ]
      \ },
      \ 'component_visible_condition': {
      \   'readonly': '(&filetype!="help"&& &readonly)',
      \   'modified': '(&filetype!="help"&&(&modified||!&modifiable))',
      \   'fugitive': '(exists("*fugitive#head") && ""!=fugitive#head())'
      \ },
      \ 'separator': { 'left': '', 'right': '' },
      \ 'subseparator': { 'left': '', 'right': '' }
      \ }

function! LightLineFugitive()
  try
    if expand('%:t') !~? 'Tagbar\|Gundo\|NERD' && &ft !~? 'vimfiler' && exists('*fugitive#head')
      let mark = ' '  " edit here for cool mark
      let _ = fugitive#head()
      return strlen(_) ? mark._ : ''
    endif
  catch
  endtry
  return ''
endfunction

" rainbow parens
let g:rbpt_colorpairs = [
    \ ['brown',       'RoyalBlue3'],
    \ ['Darkblue',    'SeaGreen3'],
    \ ['darkgray',    'DarkOrchid3'],
    \ ['darkgreen',   'firebrick3'],
    \ ['darkcyan',    'RoyalBlue3'],
    \ ['darkred',     'SeaGreen3'],
    \ ['darkmagenta', 'DarkOrchid3'],
    \ ['brown',       'firebrick3'],
    \ ['gray',        'RoyalBlue3'],
    \ ['black',       'SeaGreen3'],
    \ ['darkmagenta', 'DarkOrchid3'],
    \ ['Darkblue',    'firebrick3'],
    \ ['darkgreen',   'RoyalBlue3'],
    \ ['darkcyan',    'SeaGreen3'],
    \ ['darkred',     'DarkOrchid3'],
    \ ['red',         'firebrick3'],
    \ ]

let g:rbpt_max = 16
let g:rbpt_loadcmd_toggle = 0

au VimEnter * RainbowParenthesesToggle
au Syntax * RainbowParenthesesLoadRound
au Syntax * RainbowParenthesesLoadSquare
au Syntax * RainbowParenthesesLoadBraces

au BufRead,BufNewFile *.jbuilder setf ruby
au BufRead,BufNewFile *.rabl setf ruby
au BufRead,BufNewFile *.god setf ruby
au BufRead,BufNewFile Gemfile setf ruby
