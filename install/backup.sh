#!/bin/bash

# NÃO usar set -e para permitir que o bootstrap continue mesmo com falhas

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../scripts/utils.sh"

# ══════════════════════════════════════════════════════════════
# BACKUP INCREMENTAL DA HOME (repo backup-pc)
# ══════════════════════════════════════════════════════════════

BACKUP_REPO_SSH="git@github.com:filipecrespodev/backup-pc.git"
BACKUP_DIR="$HOME/Workspace/My/backup-pc"

install_backup() {
    info "Configurando backup-pc..."

    if [[ -d "$BACKUP_DIR/.git" ]]; then
        info "Atualizando $BACKUP_DIR"
        git -C "$BACKUP_DIR" pull --ff-only || warning "git pull falhou; seguindo com o checkout atual"
    else
        mkdir -p "$(dirname "$BACKUP_DIR")"
        info "Clonando backup-pc em $BACKUP_DIR"
        if ! git clone "$BACKUP_REPO_SSH" "$BACKUP_DIR"; then
            error "Não consegui clonar $BACKUP_REPO_SSH"
            return 1
        fi
    fi

    if [[ -x "$BACKUP_DIR/install.sh" ]]; then
        # install.sh: apt install borgbackup/udisks2, symlink da config e timer --user
        "$BACKUP_DIR/install.sh" || { error "backup-pc/install.sh falhou"; return 1; }
    else
        error "install.sh não encontrado em $BACKUP_DIR"
        return 1
    fi

    success "backup-pc configurado — status: systemctl --user list-timers 'backup-pc*'"
}

install_backup
