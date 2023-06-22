use std::ffi::CStr;
use std::sync::Arc;

use parking_lot::Mutex;
use tiktoken_rs::CoreBPE;
use tiktoken_rs::tokenizer::{get_tokenizer, Tokenizer};

use anyhow::{Result, anyhow};

// https://doc.rust-lang.org/book/ch19-01-unsafe-rust.html#using-extern-functions-to-call-external-code
// https://web.mit.edu/rust-lang_v1.25/arch/amd64_ubuntu1404/share/doc/rust/html/book/first-edition/ffi.html

pub fn get_bpe_from_tokenizer(tokenizer: Tokenizer) -> Result<Arc<Mutex<CoreBPE>>> {
    let bpe = match tokenizer {
        Tokenizer::Cl100kBase => tiktoken_rs::cl100k_base_singleton(),
        Tokenizer::R50kBase => tiktoken_rs::r50k_base_singleton(),
        Tokenizer::P50kBase => tiktoken_rs::p50k_base_singleton(),
        Tokenizer::P50kEdit => tiktoken_rs::p50k_edit_singleton(),
        Tokenizer::Gpt2 => tiktoken_rs::r50k_base_singleton(),
    };
    Ok(bpe)
}

pub fn get_bpe_from_model(model: &str) -> Result<Arc<Mutex<CoreBPE>>> {
    let tokenizer =
        get_tokenizer(model).ok_or_else(|| anyhow!("No tokenizer found for model {}", model))?;
    let bpe = get_bpe_from_tokenizer(tokenizer)?;
    Ok(bpe)
}

#[no_mangle]
pub extern "C" fn count_tokens(model: *const libc::c_char, prompt: *const libc::c_char) -> libc::c_uint {
    let model = unsafe { CStr::from_ptr(model).to_str().unwrap() };
    let prompt = unsafe { CStr::from_ptr(prompt).to_str().unwrap() };
    let bpe = get_bpe_from_model(model).unwrap();
    let count = bpe.lock().encode_with_special_tokens(prompt).len();
    count as libc::c_uint
}

#[no_mangle]
pub extern "C" fn get_context_size(model: *const libc::c_char) -> libc::c_uint {
    let model = unsafe { CStr::from_ptr(model).to_str().unwrap() };
    let size = tiktoken_rs::model::get_context_size(model);
    size as libc::c_uint
}

