use std::fmt::{self, Display};

/// Highest strobe rate the rig will accept, in hertz.
const MAX_STROBE_HZ: u32 = 24;

/// Colors the rig can project into the fog.
#[derive(Debug, Clone, Copy, PartialEq)]
enum Beam {
    Pink,
    Lime,
    Brass { warmth: u8 },
}

/// A cue borrows its label from the setlist for its whole lifetime.
struct Cue<'a> {
    label: &'a str,
    beam: Beam,
    strobe_hz: u32,
}

trait Projector {
    fn project(&mut self, cue: &Cue<'_>) -> String;
}

struct Rig<T: Display> {
    name: T,
    fired: usize,
}

impl<T: Display> Projector for Rig<T> {
    fn project(&mut self, cue: &Cue<'_>) -> String {
        self.fired += 1;
        let color = match cue.beam {
            Beam::Pink => "hot pink".to_string(),
            Beam::Lime => "laser lime".to_string(),
            Beam::Brass { warmth } => format!("brass @ {warmth}%"),
        };
        format!("[{}] {} -> {color} at {}hz\n", self.name, cue.label, cue.strobe_hz)
    }
}

impl Display for Beam {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{self:?}")
    }
}

macro_rules! cue {
    ($label:expr, $beam:expr) => {
        Cue { label: $label, beam: $beam, strobe_hz: MAX_STROBE_HZ / 2 }
    };
}

fn clamp_strobe(hz: u32) -> u32 {
    hz.min(MAX_STROBE_HZ)
}

fn main() {
    let mut rig = Rig { name: "main stage", fired: 0_usize };
    let setlist = [cue!("drop", Beam::Pink), cue!("breakdown", Beam::Brass { warmth: 80 })];

    for cue in &setlist {
        print!("{}", rig.project(cue));
    }

    if let Some(last) = setlist.last() {
        println!("last beam: {} (strobe {}hz)", last.beam, clamp_strobe(last.strobe_hz * 4));
    }

    let raw = &rig.fired as *const usize;
    // SAFETY: `raw` points at a live local that outlives this read.
    let fired = unsafe { *raw };
    println!("cues fired: {fired}, spare: {}", Beam::Lime);
}
