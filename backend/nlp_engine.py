import re
import nltk

from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.tokenize import sent_tokenize
from nltk.sentiment import SentimentIntensityAnalyzer
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


def parse_speakers(transcript):
    """
    Convert a meeting transcript into speaker + sentence records.
    """

    lines = transcript.split("\n")

    current_speaker = None
    records = []

    for line in lines:

        line = line.strip()

        if not line:
            continue

        # Detect speaker labels
        speaker_match = re.match(
            r"^([A-Za-z]+(?: [A-Za-z]+)?)\s*:",
            line
        )

        if speaker_match:
            current_speaker = (
                speaker_match.group(1).strip()
            )
            continue

        # Store spoken content
        if current_speaker:

            records.append({
                "speaker": current_speaker,
                "text": line
            })

        else:

            records.append({
                "speaker": None,
                "text": line
            })

    return records
DATE_WORDS = {
    "monday", "tuesday", "wednesday", "thursday",
    "friday", "saturday", "sunday",
    "today", "tomorrow", "yesterday",
    "next", "week", "month"
}
CORPORATE_TOPICS = [
    "backend development",
    "frontend development",
    "authentication",
    "password validation",
    "database",
    "API development",
    "integration testing",
    "project presentation",
    "user management",
    "meeting management",
    "testing",
    "deployment",
    "project planning",
    "project review",
    "software development",
    "bug fixing",
    "quality assurance",
    "performance",
    "security",
    "documentation",
]
def extract_topics(
    text,
    max_keywords=10,
    max_topics=10
):
    """
    Extract meaningful meeting topics from text.

    Parameters:
        text          : Meeting transcript/string
        max_keywords  : Maximum TF-IDF keyword/phrase candidates
        max_topics    : Maximum final topics

    Returns:
        final_topics  : Clean list of meeting topics
        keywords      : Important TF-IDF keywords/phrases
    """

    if not text or not text.strip():
        return [], []

    # -----------------------------------------------------
    # Basic cleaning
    # -----------------------------------------------------

    cleaned_text = re.sub(r"\s+", " ", text).strip()

    # -----------------------------------------------------
    # TF-IDF keyword extraction
    # Use unigrams + bigrams
    # -----------------------------------------------------

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=50
    )

    try:
        tfidf_matrix = vectorizer.fit_transform([cleaned_text])
    except ValueError:
        return [], []

    features = vectorizer.get_feature_names_out()
    scores = tfidf_matrix.toarray()[0]

    ranked_keywords = sorted(
        zip(features, scores),
        key=lambda x: x[1],
        reverse=True
    )

    keywords = [
        phrase
        for phrase, score in ranked_keywords[:max_keywords]
    ]

    # -----------------------------------------------------
    # Filter TF-IDF candidates
    # -----------------------------------------------------

    statistical_topics = []

    for phrase in keywords:

        phrase_lower = phrase.lower().strip()
        words = phrase_lower.split()

        # Ignore phrases containing date words
        if any(word in DATE_WORDS for word in words):
            continue

        # Ignore very short/noisy candidates
        if len(phrase_lower) < 4:
            continue

        # Ignore common meeting filler words
        if phrase_lower in {
            "meeting",
            "project",
            "team",
            "people",
            "everyone",
            "today",
            "work",
        }:
            continue

        statistical_topics.append(phrase_lower)

    # -----------------------------------------------------
    # Detect domain-specific topics
    # -----------------------------------------------------

    domain_topics = []

    text_lower = cleaned_text.lower()

    for topic in CORPORATE_TOPICS:
        if topic.lower() in text_lower:
            domain_topics.append(topic.lower())

    # -----------------------------------------------------
    # Combine domain + statistical topics
    # Domain topics get priority
    # -----------------------------------------------------

    combined_topics = []

    for topic in domain_topics + statistical_topics:

        if topic not in combined_topics:
            combined_topics.append(topic)

    # -----------------------------------------------------
    # Remove redundant/smaller topics
    # Example:
    # "testing" + "integration testing"
    # Keep "integration testing"
    # -----------------------------------------------------

    final_topics = []

    for topic in combined_topics:

        topic_lower = topic.lower()
        redundant = False

        for existing in final_topics:

            existing_lower = existing.lower()

            if (
                topic_lower != existing_lower
                and topic_lower in existing_lower
            ):
                redundant = True
                break

        if not redundant:
            final_topics.append(topic)

    # -----------------------------------------------------
    # Limit final topics
    # -----------------------------------------------------

    final_topics = final_topics[:max_topics]

    return final_topics, keywords
def split_action_clauses(sentence):
    """
    Split a sentence containing multiple actions.

    Example:
    'I will redesign the landing page by Tuesday and run A/B testing by Thursday.'

    Becomes:
    - I will redesign the landing page by Tuesday
    - I will run A/B testing by Thursday
    """

    sentence = sentence.strip()

    # Normalize whitespace
    sentence = re.sub(r"\s+", " ", sentence)

    # Handle "and" between two separate actions
    parts = re.split(
        r"\s+(?=and\s+(?:I|we|he|she|they|[A-Z][a-z]+)\s+(?:will|need|needs|must|should))",
        sentence,
        flags=re.IGNORECASE
    )

    # Additional handling for:
    # "... by Tuesday and run A/B testing by Thursday"
    if len(parts) == 1:
        parts = re.split(
            r"\s+and\s+(?=[a-z][a-zA-Z /-]+\s+(?:by|on)\s+)",
            sentence
        )

    return [
        part.strip(" .")
        for part in parts
        if part.strip()
    ]
def extract_owner_from_sentence(sentence, participants):
    """
    Identify the responsible person from a sentence.
    """

    # Check known participants first
    for person in participants:
        if re.search(
            rf"\b{re.escape(person)}\b",
            sentence,
            flags=re.IGNORECASE
        ):
            return person

    # Detect explicit person name even if not in participants
    match = re.search(
        r"^\s*([A-Z][a-z]+)\s+(?:will|needs to|need to|must|should)\b",
        sentence
    )

    if match:
        return match.group(1)

    return None
def extract_deadline_from_sentence(sentence):
    """
    Extract the first deadline expression from a sentence.
    """

    patterns = [
        # Month + day
        r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\b",

        # Day + month
        r"\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\b",

        # by + month + day
        r"\bby\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\b",

        # by + weekday
        r"\bby\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b",

        # next + weekday
        r"\bnext\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b",

        # today / tomorrow
        r"\b(?:today|tomorrow)\b",

        # by today / by tomorrow
        r"\bby\s+(?:today|tomorrow)\b"
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            sentence,
            flags=re.IGNORECASE
        )

        if match:
            return match.group(0).strip()

    return None
def remove_owner_and_deadline(sentence, owner=None, deadline=None):
    """
    Convert an action sentence into a clean task description.
    """

    task = sentence.strip()

    # Remove common prefixes
    task = re.sub(
        r"^(please|kindly)\s+",
        "",
        task,
        flags=re.IGNORECASE
    )

    # Remove first-person action prefix
    task = re.sub(
        r"^(I|we)\s+(will|need to|needs to|must|should)\s+",
        "",
        task,
        flags=re.IGNORECASE
    )

    # Remove explicit owner + action verb
    if owner:
        task = re.sub(
            rf"^\s*{re.escape(owner)}\s+"
            r"(will|needs to|need to|must|should)\s+",
            "",
            task,
            flags=re.IGNORECASE
        )

    # Remove deadline
    if deadline:
        task = re.sub(
            rf"\s*(?:by|on|before)?\s*{re.escape(deadline)}\s*$",
            "",
            task,
            flags=re.IGNORECASE
        )

    task = re.sub(r"\s+", " ", task)
    task = task.strip(" .,:;-")

    if task:
        task = task[0].upper() + task[1:]

    return task

def extract_action_items(transcript, participants):
    """
    Improved action-item extraction.

    Returns:
        [
            {
                "task": ...,
                "owner": ...,
                "deadline": ...,
                "status": "Pending"
            }
        ]
    """

    sentences = sent_tokenize(transcript)

    action_patterns = [
        r"\bwill\b",
        r"\bplease\b",
        r"\bneed to\b",
        r"\bneeds to\b",
        r"\bmust\b",
        r"\bshould\b"
    ]

    excluded_patterns = [
        r"^\s*the team agreed\b",
        r"^\s*the team decided\b",
        r"^\s*the decision was\b",
        r"^\s*the .* will be used\b",
        r"^\s*the .* will begin\b",
        r"^\s*the .* will launch\b",
        r"^\s*the .* is scheduled\b"
    ]

    results = []

    for sentence in sentences:

        sentence = sentence.strip()

        # Check whether this is an action sentence
        if not any(
            re.search(
                pattern,
                sentence,
                flags=re.IGNORECASE
            )
            for pattern in action_patterns
        ):
            continue

        # Skip obvious decision/event statements
        if any(
            re.search(
                pattern,
                sentence,
                flags=re.IGNORECASE
            )
            for pattern in excluded_patterns
        ):
            continue

        # Split sentences containing multiple actions
        clauses = split_action_clauses(sentence)

        for clause in clauses:

            clause = clause.strip()

            if not clause:
                continue

            # Extract owner
            owner = extract_owner_from_sentence(
                clause,
                participants
            )

            # Extract deadline
            deadline = extract_deadline_from_sentence(
                clause
            )

            # Clean task
            task = remove_owner_and_deadline(
                clause,
                owner,
                deadline
            )

            # Ignore empty tasks
            if not task:
                continue

            # Ignore incomplete fragments such as "Update"
            if len(task.split()) < 2:
                continue

            results.append({
                "task": task,
                "owner": owner,
                "deadline": deadline,
                "status": "Pending"
            })

    # Remove duplicates
    unique_results = []
    seen = set()

    for item in results:

        key = (
            item["task"].lower(),
            str(item["owner"]).lower(),
            str(item["deadline"]).lower()
        )

        if key not in seen:
            seen.add(key)
            unique_results.append(item)

    return unique_results

    # --------------------------------------------------------
    # Remove duplicate action items
    # --------------------------------------------------------

    unique_results = []
    seen = set()

    for item in results:

        key = (
            item["task"].lower(),
            str(item["owner"]).lower(),
            str(item["deadline"]).lower()
        )

        if key not in seen:
            seen.add(key)
            unique_results.append(item)

    return unique_results
def extract_decisions(transcript):
    """
    Extract decisions from a meeting transcript.

    Looks for phrases that indicate a confirmed decision.
    """

    decision_patterns = [
        r"\bwe have decided to\b",
        r"\bwe decided to\b",
        r"\bthe team has decided to\b",
        r"\bthe team decided to\b",
        r"\bwe will use\b",
        r"\bwe will adopt\b",
        r"\bwe will proceed with\b",
        r"\bwe agreed to\b",
        r"\bagreed\b",
        r"\bthe decision is\b",
        r"\bit was decided that\b"
    ]

    sentences = sent_tokenize(transcript)

    decisions = []

    for sentence in sentences:

        for pattern in decision_patterns:

            if re.search(
                pattern,
                sentence,
                flags=re.IGNORECASE
            ):

                decision = sentence.strip()

                # Remove duplicate decisions
                if decision not in decisions:
                    decisions.append(decision)

                break

    # Convert to structured format
    structured_decisions = []

    for decision in decisions:

        structured_decisions.append({
            "decision": decision
        })

    return structured_decisions
sentiment_analyzer = SentimentIntensityAnalyzer()


def classify_sentiment(compound_score):

    if compound_score >= 0.05:
        return "Positive"

    elif compound_score <= -0.05:
        return "Negative"

    else:
        return "Neutral"
def analyze_meeting_sentiment(text):

    if not text or not text.strip():

        return {
            "overall_sentiment": "Neutral",
            "compound_score": 0.0,
            "positive": 0.0,
            "neutral": 1.0,
            "negative": 0.0,
            "sentence_analysis": []
        }

    # -------------------------------------------------
    # Overall sentiment
    # -------------------------------------------------

    overall_scores = sentiment_analyzer.polarity_scores(
        text
    )

    overall_sentiment = classify_sentiment(
        overall_scores["compound"]
    )


    # -------------------------------------------------
    # Sentence-level sentiment
    # -------------------------------------------------

    sentences = sent_tokenize(text)

    sentence_analysis = []


    for sentence in sentences:

        scores = sentiment_analyzer.polarity_scores(
            sentence
        )

        sentence_sentiment = classify_sentiment(
            scores["compound"]
        )

        sentence_analysis.append({
            "sentence": sentence,
            "sentiment": sentence_sentiment,
            "positive": scores["pos"],
            "neutral": scores["neu"],
            "negative": scores["neg"],
            "compound_score": scores["compound"]
        })


    # -------------------------------------------------
    # Return structured result
    # -------------------------------------------------

    return {
        "overall_sentiment": overall_sentiment,
        "compound_score": overall_scores["compound"],
        "positive": overall_scores["pos"],
        "neutral": overall_scores["neu"],
        "negative": overall_scores["neg"],
        "sentence_analysis": sentence_analysis
    }
# =====================================================
# SUMMARIZATION MODEL
# =====================================================

model_id = "facebook/bart-large-cnn"

tokenizer = AutoTokenizer.from_pretrained(model_id)

model = AutoModelForSeq2SeqLM.from_pretrained(model_id)

print("Summarization model loaded successfully!")


# =====================================================
# ABSTRACTIVE SUMMARIZATION
# =====================================================

def generate_abstractive_summary(text, max_new_tokens=100):

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=1024
    )

    outputs = model.generate(
        **inputs,
        max_new_tokens=max_new_tokens,
        num_beams=4,
        no_repeat_ngram_size=3,
        early_stopping=True
    )

    return tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    )

def generate_abstractive_summary(text, max_new_tokens=100):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=1024
    )

    outputs = model.generate(
        **inputs,
        max_new_tokens=max_new_tokens,
        num_beams=4,
        no_repeat_ngram_size=3,
        early_stopping=True
    )

    return tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    )
# =====================================================
# SENTENCE EMBEDDING MODEL
# =====================================================

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

print("Sentence embedding model loaded successfully.")
# =====================================================
# MEETING EMBEDDINGS
# =====================================================

def prepare_meeting_embeddings(transcript):

    sentences = sent_tokenize(transcript)

    # Remove very short sentences
    sentences = [
        sentence.strip()
        for sentence in sentences
        if len(sentence.strip()) > 10
    ]

    embeddings = embedding_model.encode(
        sentences,
        convert_to_numpy=True
    )

    return sentences, embeddings
    # Overall sentiment
    overall_scores = sentiment_analyzer.polarity_scores(
        text
    )

    overall_sentiment = classify_sentiment(
        overall_scores["compound"]
    )

    # Sentence-level sentiment
    sentences = sent_tokenize(text)

    sentence_analysis = []

    for sentence in sentences:

        scores = sentiment_analyzer.polarity_scores(
            sentence
        )

        sentence_sentiment = classify_sentiment(
            scores["compound"]
        )

        sentence_analysis.append({
            "sentence": sentence,
            "sentiment": sentence_sentiment,
            "positive": scores["pos"],
            "neutral": scores["neu"],
            "negative": scores["neg"],
            "compound_score": scores["compound"]
        })

    # Return result
    return {
        "overall_sentiment": overall_sentiment,
        "compound_score": overall_scores["compound"],
        "positive": overall_scores["pos"],
        "neutral": overall_scores["neu"],
        "negative": overall_scores["neg"],
        "sentence_analysis": sentence_analysis
    }
    sentences = sent_tokenize(transcript)

    action_patterns = [
        r"\bwill\b",
        r"\bplease\b",
        r"\bneed to\b",
        r"\bneeds to\b",
        r"\bmust\b",
        r"\bshould\b"
    ]

    results = []

    for sentence in sentences:

        if not any(
            re.search(
                pattern,
                sentence,
                flags=re.IGNORECASE
            )
            for pattern in action_patterns
        ):
            continue

        clauses = split_action_clauses(sentence)

        for clause in clauses:

            owner = extract_owner_from_sentence(
                clause,
                participants
            )

            deadline = extract_deadline_from_sentence(
                clause
            )

            task = remove_owner_and_deadline(
                clause,
                owner,
                deadline
            )

            # Ignore empty or meaningless tasks
            if not task:
                continue

            results.append({
                "task": task,
                "owner": owner,
                "deadline": deadline,
                "status": "Pending"
            })

    # --------------------------------------------------------
    # Remove duplicates
    # --------------------------------------------------------

    unique_results = []
    seen = set()

    for item in results:

        key = (
            item["task"].lower(),
            str(item["owner"]).lower(),
            str(item["deadline"]).lower()
        )

        if key not in seen:
            seen.add(key)
            unique_results.append(item)

    return unique_results
# =====================================================
# SEMANTIC SEARCH
# =====================================================

def semantic_search(
    query,
    sentences,
    embeddings,
    top_k=5
):
    """
    Retrieve the most semantically relevant
    meeting sentences for a user query.
    """

    # Convert query into an embedding
    query_embedding = embedding_model.encode(
        [query],
        convert_to_numpy=True
    )

    # Calculate similarity
    similarities = cosine_similarity(
        query_embedding,
        embeddings
    )[0]

    # Sort from highest to lowest similarity
    ranked_indices = similarities.argsort()[::-1]

    results = []

    for index in ranked_indices[:top_k]:

        results.append({
            "sentence": sentences[index],
            "similarity": float(
                similarities[index]
            )
        })

    return results
def answer_meeting_question(
    question,
    sentences,
    embeddings,
    top_k=3
):
    """
    Answer a question using information
    retrieved from the meeting transcript.
    """

    results = semantic_search(
        question,
        sentences,
        embeddings,
        top_k=top_k
    )

    if not results:
        return {
            "question": question,
            "answer": "No relevant information found.",
            "sources": []
        }

    # Best matching sentence
    best_result = results[0]

    answer = best_result["sentence"]

    return {
        "question": question,
        "answer": answer,
        "confidence": best_result["similarity"],
        "sources": results
    }
# =====================================================
# OUTPUT CLEANING
# =====================================================

def clean_topics(topics, participants):
    """
    Remove participant names and overly generic topics.
    """

    participant_names = {
        str(name).lower().strip()
        for name in participants
        if name
    }

    generic_topics = {
        "meeting",
        "project",
        "team",
        "people",
        "everyone",
        "work",
        "today",
        "testing",
        "backend",
        "apis"
    }

    cleaned = []

    for topic in topics:

        topic_clean = topic.strip()
        topic_lower = topic_clean.lower()

        if not topic_clean:
            continue

        # Remove exact participant names
        if topic_lower in participant_names:
            continue

        # Remove generic single-word topics
        if topic_lower in generic_topics:
            continue

        # Remove topics that contain only participant names
        topic_words = topic_lower.split()

        if topic_words and all(
            word in participant_names
            for word in topic_words
        ):
            continue

        # Avoid duplicates
        if topic_lower not in {
            item.lower()
            for item in cleaned
        }:
            cleaned.append(topic_clean)

    return cleaned


def clean_action_items(action_items):
    """
    Clean action-item task text and preserve
    owner/deadline/status fields.
    """

    cleaned_items = []

    for item in action_items or []:

        task = str(
            item.get("task", "")
        ).strip()

        owner = item.get(
            "owner",
            None
        )

        deadline = item.get(
            "deadline",
            None
        )

        status = item.get(
            "status",
            "Pending"
        )

        # Remove speaker prefix from task
        if ":" in task:

            prefix, remainder = task.split(
                ":",
                1
            )

            prefix = prefix.strip()

            if owner and prefix.lower() != str(owner).lower():
                pass
            else:
                task = remainder.strip()

        # Clean owner if available
        if owner:
            owner = str(owner).strip()

        # Clean deadline
        if deadline:
            deadline = str(deadline).strip()

        cleaned_items.append({
            "task": task,
            "owner": owner,
            "deadline": deadline,
            "status": status
        })

    return cleaned_items


def clean_decisions(decisions):
    """
    Remove speaker names and formatting from decisions.
    """

    cleaned_decisions = []

    for item in decisions or []:

        decision = str(
            item.get("decision", "")
        ).strip()

        # Remove speaker prefix such as:
        # Priya:
        if ":" in decision:

            first_line, remainder = decision.split(
                ":",
                1
            )

            if "\n" in remainder:
                decision = remainder.strip()

        # Normalize newlines
        decision = " ".join(
            decision.split()
        )

        if decision:
            cleaned_decisions.append({
                "decision": decision
            })

    return cleaned_decisions


def clean_summary(summary):
    """
    Remove obvious irrelevant/generated noise
    from the summary.
    """

    if not summary:
        return ""

    summary = " ".join(
        str(summary).split()
    )

    unwanted_phrases = [
        "Back to Mail Online home.",
        "back to the page you came from.",
        "Back to the page you came from."
    ]

    for phrase in unwanted_phrases:
        summary = summary.replace(
            phrase,
            ""
        )

    return " ".join(
        summary.split()
    )
# =====================================================
# COMPLETE MEETING PROCESSING PIPELINE
# =====================================================

def process_meeting(transcript):

    if not transcript or not transcript.strip():
        return {
            "status": "error",
            "message": "Empty transcript"
        }

    # 1. Speakers
    speaker_records = parse_speakers(
        transcript
    )

    participants = list({
        record["speaker"]
        for record in speaker_records
        if record["speaker"]
    })

    # 2. Topics
    topics, keywords = extract_topics(
        transcript
    )

    # 3. Action items
    action_items = extract_action_items(
        transcript,
        participants
    )

    if action_items is None:
        action_items = []

    # 4. Decisions
    decisions = extract_decisions(
        transcript
    )

    # 5. Sentiment
    sentiment = analyze_meeting_sentiment(
        transcript
    )

    # 6. Summary
    summary = generate_abstractive_summary(
        transcript,
        max_new_tokens=100
    )


    # =================================================
    # CLEAN THE RESULTS
    # =================================================

    topics = clean_topics(
        topics,
        participants
    )

    action_items = clean_action_items(
        action_items
    )

    decisions = clean_decisions(
        decisions
    )

    summary = clean_summary(
        summary
    )


    # Final result
    return {
        "status": "success",
        "participants": participants,
        "speaker_records": speaker_records,
        "topics": topics,
        "keywords": keywords,
        "action_items": action_items,
        "decisions": decisions,
        "sentiment": sentiment,
        "summary": summary,
    }
if __name__ == "__main__":

    test_transcript = """
Rahul:
The backend APIs are almost complete.

Ananya:
The frontend dashboard is progressing well.

David:
I will lead integration testing on Monday.

Priya:
I will prepare the final project presentation by next Wednesday.

Project Manager:
Rahul will fix the password validation issues by Thursday.

Priya:
We have decided to use MySQL as the primary database
and Flask as the backend framework.
"""

    result = process_meeting(test_transcript)

    print("\nMEETING PROCESSING RESULT")
    print("=" * 60)

    print("\nPARTICIPANTS:")
    print(result["participants"])

    print("\nTOPICS:")
    print(result["topics"])

    print("\nKEYWORDS:")
    print(result["keywords"])

    print("\nACTION ITEMS:")
    for item in result["action_items"]:
        print(item)

    print("\nDECISIONS:")
    for decision in result["decisions"]:
        print(decision)

    print("\nSENTIMENT:")
    print(result["sentiment"]["overall_sentiment"])

    print("\nSUMMARY:")
    print(result["summary"])
