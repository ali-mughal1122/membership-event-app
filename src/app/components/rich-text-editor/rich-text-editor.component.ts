import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
  template: `
    <div class="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-1 p-2 bg-gray-50/80 dark:bg-zinc-800/80 border-b border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300">
        <!-- Formatting Options -->
        <button
          type="button"
          (click)="exec('bold')"
          class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors font-bold text-xs w-7 h-7 flex items-center justify-center"
          title="Bold (Ctrl+B)">
          B
        </button>

        <button
          type="button"
          (click)="exec('italic')"
          class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors italic text-xs w-7 h-7 flex items-center justify-center"
          title="Italic (Ctrl+I)">
          I
        </button>

        <button
          type="button"
          (click)="exec('underline')"
          class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors underline text-xs w-7 h-7 flex items-center justify-center"
          title="Underline (Ctrl+U)">
          U
        </button>

        <span class="w-[1px] h-5 bg-gray-200 dark:bg-zinc-700 mx-1"></span>

        <!-- Heading Tags -->
        <button
          type="button"
          (click)="formatBlock('h2')"
          class="px-2 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors font-bold text-xs flex items-center justify-center"
          title="Heading 2">
          H2
        </button>

        <button
          type="button"
          (click)="formatBlock('h3')"
          class="px-2 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors font-bold text-xs flex items-center justify-center"
          title="Heading 3">
          H3
        </button>

        <button
          type="button"
          (click)="formatBlock('p')"
          class="px-2 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors font-semibold text-xs flex items-center justify-center"
          title="Normal Paragraph">
          ¶
        </button>

        <span class="w-[1px] h-5 bg-gray-200 dark:bg-zinc-700 mx-1"></span>

        <!-- Lists -->
        <button
          type="button"
          (click)="exec('insertUnorderedList')"
          class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors text-xs w-7 h-7 flex items-center justify-center"
          title="Bullet List">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16M2 6h.01M2 12h.01M2 18h.01"></path>
          </svg>
        </button>

        <button
          type="button"
          (click)="exec('insertOrderedList')"
          class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors text-xs w-7 h-7 flex items-center justify-center"
          title="Numbered List">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01"></path>
          </svg>
        </button>

        <span class="w-[1px] h-5 bg-gray-200 dark:bg-zinc-700 mx-1"></span>

        <!-- Blockquote -->
        <button
          type="button"
          (click)="formatBlock('blockquote')"
          class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors text-xs w-7 h-7 flex items-center justify-center"
          title="Blockquote">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
        </button>

        <!-- Hyperlink -->
        <button
          type="button"
          (click)="insertLink()"
          class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors text-xs w-7 h-7 flex items-center justify-center"
          title="Insert Link">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
          </svg>
        </button>

        <!-- Clear formatting -->
        <button
          type="button"
          (click)="exec('removeFormat')"
          class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors text-xs w-7 h-7 flex items-center justify-center ml-auto"
          title="Clear Formatting">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Editable Area -->
      <div
        #editor
        contenteditable="true"
        (input)="onInput()"
        (blur)="onTouched()"
        [attr.placeholder]="placeholder"
        class="rich-editor-content p-4 min-h-[220px] max-h-[380px] overflow-y-auto outline-none text-sm text-gray-900 dark:text-white leading-relaxed focus:outline-none">
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .rich-editor-content:empty:before {
      content: attr(placeholder);
      color: #9ca3af;
      pointer-events: none;
      display: block;
    }
    .rich-editor-content h2 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-top: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .rich-editor-content h3 {
      font-size: 1.1rem;
      font-weight: 700;
      margin-top: 0.5rem;
      margin-bottom: 0.25rem;
    }
    .rich-editor-content p {
      margin-bottom: 0.5rem;
    }
    .rich-editor-content ul {
      list-style-type: disc;
      padding-left: 1.25rem;
      margin-bottom: 0.5rem;
    }
    .rich-editor-content ol {
      list-style-type: decimal;
      padding-left: 1.25rem;
      margin-bottom: 0.5rem;
    }
    .rich-editor-content blockquote {
      border-left: 3px solid #10b981;
      padding-left: 0.75rem;
      margin-left: 0;
      color: #6b7280;
      font-style: italic;
    }
    .rich-editor-content a {
      color: #059669;
      text-decoration: underline;
    }
  `],
})
export class RichTextEditorComponent implements ControlValueAccessor, OnChanges {
  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;
  @Input() placeholder = 'Write article content here...';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && this.editorRef) {
      if (this.editorRef.nativeElement.innerHTML !== this.value) {
        this.editorRef.nativeElement.innerHTML = this.value || '';
      }
    }
  }

  writeValue(val: string): void {
    this.value = val || '';
    if (this.editorRef) {
      this.editorRef.nativeElement.innerHTML = this.value;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput() {
    const html = this.editorRef.nativeElement.innerHTML;
    this.value = html;
    this.onChange(html);
    this.valueChange.emit(html);
  }

  exec(command: string, value: string | undefined = undefined) {
    document.execCommand(command, false, value);
    this.onInput();
  }

  formatBlock(tag: string) {
    document.execCommand('formatBlock', false, `<${tag}>`);
    this.onInput();
  }

  insertLink() {
    const url = prompt('Enter link URL (e.g. https://...):');
    if (url) {
      this.exec('createLink', url);
    }
  }
}

