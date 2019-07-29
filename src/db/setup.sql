CREATE TABLE USER (
  UserId    INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  Email     VARCHAR(30) NOT NULL,
  Name      VARCHAR(50),
  Gender    ENUM('MALE', 'FEMALE', 'UNIDENTIFIED') NOT NULL,
  BirthDate DATE
) Engine = InnoDB;

CREATE TABLE WEBSITE (
  WebsiteId   INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  Url         VARCHAR(250) NOT NULL,
  Hostname    VARCHAR(50) NOT NULL,
  Topic       VARCHAR(20)
) Engine = InnoDB;

CREATE TABLE VISIT (
  VisitId  INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  WebsiteId INT NOT NULL,
  UserId    INT NOT NULL,
  VisitDate DATETIME NOT NULL,
  CONSTRAINT `fk_visit_website`
    FOREIGN KEY (WebsiteId) REFERENCES WEBSITE(WebsiteId)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `fk_visit_user`
    FOREIGN KEY (UserId) REFERENCES USER(UserId)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
) Engine = InnoDB;

CREATE UNIQUE INDEX UNIQUE_EMAIL_USER ON USER(Email);
CREATE UNIQUE INDEX UNIQUE_URL_WEBSITE ON WEBSITE(Url);
CREATE INDEX WEBSITE_USER_VISIT ON VISIT(WebsiteId, UserId);
;

DROP PROCEDURE IF EXISTS sp_user_ins;
DROP PROCEDURE IF EXISTS sp_user_sel;
DROP PROCEDURE IF EXISTS sp_user_sel_cursor;
DROP PROCEDURE IF EXISTS sp_visit_ins;

DELIMITER //

CREATE PROCEDURE sp_user_ins (pEmail varchar(30), pName varchar(50), pGender varchar(20), pBirthDate date)
BEGIN
    INSERT INTO USER
      (EMAIL, NAME, GENDER, BIRTHDATE) 
      VALUES (pEmail, pName, pGender, pBirthDate)
        ON DUPLICATE KEY UPDATE Name = pName, Gender = pGender, BirthDate = pBirthDate;
    
    SELECT UserId FROM USER WHERE EMAIL = pEmail;
END;
//

CREATE PROCEDURE sp_user_sel (pEmail varchar(30), pIdUser INT)
BEGIN
    SELECT
        *
    FROM
        USER u
    WHERE
        u.Email = IFNULL(pEmail, u.Email)
        AND u.UserId = IFNULL(pIdUser, u.UserId);
END;
//

CREATE PROCEDURE sp_user_sel_cursor (pThreshold INT, pSkip INT, pSortBy varchar(10), pSortOrder VARCHAR(4))
BEGIN
    IF pSortOrder = 'ASC' THEN
        SELECT
            *
        FROM
            USER u
        ORDER BY (case pSortBy
                    WHEN 'id' THEN UserId 
                    WHEN 'email' THEN Email
                    WHEN 'name' THEN Name
                    WHEN 'gender' THEN Gender
                    WHEN 'date_of_birth' THEN BirthDate
                    end) ASC
        LIMIT pSkip, pThreshold;
    ELSEIF pSortOrder = 'DESC' THEN
        SELECT
            *
        FROM
            USER u
        ORDER BY (case pSortBy
                    WHEN 'id' THEN UserId 
                    WHEN 'email' THEN Email
                    WHEN 'name' THEN Name
                    WHEN 'gender' THEN Gender
                    WHEN 'date_of_birth' THEN BirthDate
                    end) DESC
        LIMIT pSkip, pThreshold;
    END IF;
END;
//

CREATE PROCEDURE sp_website_ins (pUrl varchar(250), pHostname varchar(50), pTopic varchar(20))
BEGIN
    INSERT INTO WEBSITE
      (URL, HOSTNAME, TOPIC) 
      VALUES (pUrl, pHostname, pTopic)
        ON DUPLICATE KEY UPDATE TOPIC = pTopic;
        
    SELECT WebsiteId FROM WEBSITE WHERE URL = pUrl;
END;
//

CREATE PROCEDURE sp_website_sel_cursor (pThreshold INT, pSkip INT, pSortBy varchar(10), pSortOrder VARCHAR(4))
BEGIN
    IF pSortOrder = 'ASC' THEN
        SELECT
            *
        FROM
            WEBSITE
        ORDER BY (case pSortBy
                    WHEN 'id' THEN WebsiteId 
                    WHEN 'url' THEN Url
                    WHEN 'topic' THEN Topic
                    end) ASC
        LIMIT pSkip, pThreshold;
    ELSEIF pSortOrder = 'DESC' THEN
        SELECT
            *
        FROM
            WEBSITE
        ORDER BY (case pSortBy
                    WHEN 'id' THEN WebsiteId
                    WHEN 'url' THEN Url
                    WHEN 'topic' THEN Topic
                    end) DESC
        LIMIT pSkip, pThreshold;
    END IF;
END;
//

CREATE PROCEDURE sp_website_sel (pHostname varchar(250), pIdWebsite INT)
BEGIN
    SELECT
      *
    FROM
      WEBSITE w
    WHERE
      w.HOSTNAME = IFNULL(pHostname, w.HOSTNAME)
      AND w.WebsiteId = IFNULL(pIdWebsite, w.WebsiteId);
END;

//

CREATE PROCEDURE sp_visit_ins (pUserId INT, pWebsiteId INT, pVisitDate DATETIME)
BEGIN
    INSERT INTO VISIT
      (UserId, WebsiteId, VisitDate) 
      VALUES (pUserId, pWebsiteId, pVisitDate);
        
    SELECT LAST_INSERT_ID() AS VisitId;
END;

//

CREATE PROCEDURE sp_stats_sel (pDataInicio DATETIME, pDataFinal DATETIME, pIdadeInicio INT, pIdadeFim INT, pGender VARCHAR(20), pUsers TEXT, pHostnames TEXT)
BEGIN
    SELECT 
        V.VisitId AS VisitId,
        V.VisitDate AS VisitDate,
        U.UserId AS UserId,
        U.Email AS Email,
        U.Gender AS Gender,
        U.BirthDate AS BirthDate,
        U.Name AS Name,
        W.WebsiteId AS WebsiteId,
        W.Url AS Url,
        W.Hostname AS Hostname,
        W.Topic AS Topic
    FROM
        VISIT V
        INNER JOIN USER U ON V.UserId = U.UserId
        INNER JOIN WEBSITE W ON V.WebsiteId = W.WebsiteId
    WHERE
        V.VisitDate BETWEEN pDataInicio AND pDataFinal
        AND TIMESTAMPDIFF(YEAR, IFNULL(U.BirthDate, CURDATE()), CURDATE()) BETWEEN pIdadeInicio AND pIdadeFim
        AND U.Gender = IFNULL(pGender, U.Gender)
        AND (pUsers IS NULL OR FIND_IN_SET(U.UserId, pUsers) > 0)
        AND (pHostnames IS NULL OR FIND_IN_SET(W.Hostname, pHostnames) > 0);

END;

//